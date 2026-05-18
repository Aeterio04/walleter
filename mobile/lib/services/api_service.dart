import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';
import '../models/user.dart';
import '../models/transaction.dart';
import '../models/budget.dart';
import '../models/investment.dart';
import '../models/insight.dart';
import '../models/copilot_response.dart';
import 'storage_service.dart';

/// HTTP client with auto-refresh, ported from web's api.ts.
class ApiService {
  final StorageService _storage;

  ApiService(this._storage);

  // ── Core HTTP ──

  Future<Map<String, String>> _headers() async {
    final headers = <String, String>{'Content-Type': 'application/json'};
    final token = _storage.accessToken;
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Future<dynamic> _request(
    String method,
    String endpoint, {
    Map<String, dynamic>? body,
    Map<String, String>? queryParams,
  }) async {
    var uri = Uri.parse('${AppConfig.apiBaseUrl}$endpoint');
    if (queryParams != null && queryParams.isNotEmpty) {
      uri = uri.replace(queryParameters: queryParams);
    }

    final headers = await _headers();
    http.Response response;

    switch (method) {
      case 'GET':
        response = await http.get(uri, headers: headers);
        break;
      case 'POST':
        response = await http.post(uri, headers: headers, body: body != null ? jsonEncode(body) : null);
        break;
      case 'PATCH':
        response = await http.patch(uri, headers: headers, body: body != null ? jsonEncode(body) : null);
        break;
      case 'DELETE':
        response = await http.delete(uri, headers: headers);
        break;
      default:
        throw Exception('Unsupported method: $method');
    }

    // Auto-refresh on 401
    if (response.statusCode == 401 && _storage.refreshToken != null) {
      final refreshed = await _refreshAccessToken();
      if (refreshed) {
        final retryHeaders = await _headers();
        switch (method) {
          case 'GET':
            response = await http.get(uri, headers: retryHeaders);
            break;
          case 'POST':
            response = await http.post(uri, headers: retryHeaders, body: body != null ? jsonEncode(body) : null);
            break;
          case 'PATCH':
            response = await http.patch(uri, headers: retryHeaders, body: body != null ? jsonEncode(body) : null);
            break;
          case 'DELETE':
            response = await http.delete(uri, headers: retryHeaders);
            break;
        }
      } else {
        await _storage.clearTokens();
        throw AuthException('Session expired');
      }
    }

    if (response.statusCode == 204) return null;

    if (response.statusCode >= 400) {
      final error = jsonDecode(response.body);
      throw ApiException(error['detail'] ?? 'Request failed', response.statusCode);
    }

    return jsonDecode(response.body);
  }

  Future<bool> _refreshAccessToken() async {
    try {
      final response = await http.post(
        Uri.parse('${AppConfig.apiBaseUrl}/auth/refresh'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refresh_token': _storage.refreshToken}),
      );
      if (response.statusCode != 200) return false;
      final data = jsonDecode(response.body);
      await _storage.setAccessToken(data['access_token']);
      return true;
    } catch (_) {
      return false;
    }
  }

  // ── Auth ──

  Future<AuthResponse> signup(String name, String email, String password) async {
    final data = await _request('POST', '/auth/signup', body: {
      'name': name,
      'email': email,
      'password': password,
    });
    final auth = AuthResponse.fromJson(data);
    await _storage.setTokens(auth.accessToken, auth.refreshToken);
    return auth;
  }

  Future<AuthResponse> login(String email, String password) async {
    final data = await _request('POST', '/auth/login', body: {
      'email': email,
      'password': password,
    });
    final auth = AuthResponse.fromJson(data);
    await _storage.setTokens(auth.accessToken, auth.refreshToken);
    return auth;
  }

  Future<void> logout() async {
    try {
      await _request('POST', '/auth/logout', body: {
        'refresh_token': _storage.refreshToken,
      });
    } catch (_) {}
    await _storage.clearTokens();
  }

  // ── User ──

  Future<User> getCurrentUser() async {
    final data = await _request('GET', '/users/me');
    return User.fromJson(data);
  }

  Future<User> updateUser(Map<String, dynamic> updates) async {
    final data = await _request('PATCH', '/users/me', body: updates);
    return User.fromJson(data);
  }

  // ── Transactions ──

  Future<List<Transaction>> getTransactions({String? type, String? category}) async {
    final params = <String, String>{};
    if (type != null) params['type'] = type;
    if (category != null) params['category'] = category;
    final data = await _request('GET', '/transactions', queryParams: params.isNotEmpty ? params : null);
    return (data as List).map((j) => Transaction.fromJson(j)).toList();
  }

  Future<Transaction> createTransaction(Map<String, dynamic> txData) async {
    final data = await _request('POST', '/transactions', body: txData);
    return Transaction.fromJson(data);
  }

  Future<void> deleteTransaction(String id) async {
    await _request('DELETE', '/transactions/$id');
  }

  // ── Budgets ──

  Future<List<Budget>> getBudgets() async {
    final data = await _request('GET', '/budgets');
    return (data as List).map((j) => Budget.fromJson(j)).toList();
  }

  Future<Budget> createBudget(Map<String, dynamic> budgetData) async {
    final data = await _request('POST', '/budgets', body: budgetData);
    return Budget.fromJson(data);
  }

  Future<Budget> updateBudget(String id, Map<String, dynamic> updates) async {
    final data = await _request('PATCH', '/budgets/$id', body: updates);
    return Budget.fromJson(data);
  }

  Future<void> deleteBudget(String id) async {
    await _request('DELETE', '/budgets/$id');
  }

  // ── Investments ──

  Future<List<Investment>> getInvestments() async {
    final data = await _request('GET', '/investments');
    return (data as List).map((j) => Investment.fromJson(j)).toList();
  }

  Future<Investment> createInvestment(Map<String, dynamic> invData) async {
    final data = await _request('POST', '/investments', body: invData);
    return Investment.fromJson(data);
  }

  Future<void> deleteInvestment(String id) async {
    await _request('DELETE', '/investments/$id');
  }

  // ── AI Insights ──

  Future<List<AIInsight>> getInsights({bool includeDismissed = false}) async {
    final params = includeDismissed ? {'include_dismissed': 'true'} : null;
    final data = await _request('GET', '/insights', queryParams: params);
    return (data as List).map((j) => AIInsight.fromJson(j)).toList();
  }

  Future<Map<String, dynamic>> generateInsights({bool force = false}) async {
    final data = await _request('POST', '/insights/generate', body: {'force': force});
    return data;
  }

  Future<void> dismissInsight(String id) async {
    await _request('PATCH', '/insights/$id/dismiss');
  }

  Future<void> deleteInsight(String id) async {
    await _request('DELETE', '/insights/$id');
  }

  Future<InsightLimits> getInsightLimits() async {
    final data = await _request('GET', '/insights/limits');
    return InsightLimits.fromJson(data);
  }

  // ── Copilot ──

  Future<CopilotResponse> sendCopilotMessage(String message) async {
    final data = await _request('POST', '/copilot/chat', body: {'message': message});
    return CopilotResponse.fromJson(data);
  }
}

// ── Exceptions ──

class ApiException implements Exception {
  final String message;
  final int statusCode;
  ApiException(this.message, this.statusCode);

  @override
  String toString() => message;
}

class AuthException implements Exception {
  final String message;
  AuthException(this.message);

  @override
  String toString() => message;
}
