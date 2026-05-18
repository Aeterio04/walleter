import 'package:flutter/material.dart';
import '../models/user.dart';
import '../models/transaction.dart';
import '../models/budget.dart';
import '../models/investment.dart';
import '../models/insight.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

/// Central state management — mirrors web's AppContext.tsx.
class AppProvider extends ChangeNotifier {
  final ApiService api;
  final StorageService storage;

  AppProvider({required this.api, required this.storage});

  // ── State ──
  User? _user;
  List<Transaction> _transactions = [];
  List<Budget> _budgets = [];
  List<Investment> _investments = [];
  List<AIInsight> _insights = [];
  InsightLimits? _insightLimits;
  bool _loading = true;
  String? _error;

  // ── Getters ──
  User? get user => _user;
  List<Transaction> get transactions => _transactions;
  List<Budget> get budgets => _budgets;
  List<Investment> get investments => _investments;
  List<AIInsight> get insights => _insights;
  InsightLimits? get insightLimits => _insightLimits;
  bool get loading => _loading;
  String? get error => _error;
  bool get isLoggedIn => _user != null;

  // ── Derived ──
  double get totalCredit =>
      _transactions.where((t) => t.isCredit).fold(0.0, (a, t) => a + t.amount);
  double get totalDebit =>
      _transactions.where((t) => t.isDebit).fold(0.0, (a, t) => a + t.amount);
  double get balance => totalCredit - totalDebit;
  double get totalInvested =>
      _investments.fold(0.0, (a, i) => a + i.value);

  Map<String, double> get categorySpending {
    final map = <String, double>{};
    for (final t in _transactions.where((t) => t.isDebit)) {
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    }
    return map;
  }

  List<Transaction> get recentTransactions =>
      _transactions.take(5).toList();

  // ── Init ──
  Future<void> initialize() async {
    if (storage.isLoggedIn) {
      await loadUserData();
    } else {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> loadUserData() async {
    try {
      _loading = true;
      _error = null;
      notifyListeners();

      _user = await api.getCurrentUser();

      // Load all data in parallel
      final results = await Future.wait([
        api.getTransactions(),
        api.getBudgets(),
        api.getInvestments(),
        api.getInsights(),
        api.getInsightLimits(),
      ]);

      _transactions = results[0] as List<Transaction>;
      _budgets = results[1] as List<Budget>;
      _investments = results[2] as List<Investment>;
      _insights = results[3] as List<AIInsight>;
      _insightLimits = results[4] as InsightLimits;
    } catch (e) {
      _error = e.toString();
      if (e is AuthException) {
        await storage.clearTokens();
        _user = null;
      }
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  // ── Auth ──
  Future<void> login(String email, String password) async {
    await api.login(email, password);
    await loadUserData();
  }

  Future<void> signup(String name, String email, String password) async {
    await api.signup(name, email, password);
    await loadUserData();
  }

  Future<void> logout() async {
    await api.logout();
    _user = null;
    _transactions = [];
    _budgets = [];
    _investments = [];
    _insights = [];
    notifyListeners();
  }

  Future<void> togglePlan() async {
    if (_user == null) return;
    final newPlan = _user!.plan == 'FREE' ? 'PRO' : 'FREE';
    await api.updateUser({'plan': newPlan});
    _user = await api.getCurrentUser();
    _insightLimits = await api.getInsightLimits();
    notifyListeners();
  }

  // ── Transactions ──
  Future<void> refreshTransactions() async {
    _transactions = await api.getTransactions();
    notifyListeners();
  }

  Future<void> addTransaction(Map<String, dynamic> data) async {
    await api.createTransaction(data);
    await refreshTransactions();
    // Also refresh budgets to update spent
    _budgets = await api.getBudgets();
    notifyListeners();
  }

  Future<void> deleteTransaction(String id) async {
    await api.deleteTransaction(id);
    await refreshTransactions();
    _budgets = await api.getBudgets();
    notifyListeners();
  }

  // ── Budgets ──
  Future<void> refreshBudgets() async {
    _budgets = await api.getBudgets();
    notifyListeners();
  }

  Future<void> addBudget(Map<String, dynamic> data) async {
    await api.createBudget(data);
    await refreshBudgets();
  }

  Future<void> updateBudget(String id, Map<String, dynamic> data) async {
    await api.updateBudget(id, data);
    await refreshBudgets();
  }

  Future<void> deleteBudget(String id) async {
    await api.deleteBudget(id);
    await refreshBudgets();
  }

  // ── Investments ──
  Future<void> refreshInvestments() async {
    _investments = await api.getInvestments();
    notifyListeners();
  }

  // ── Insights ──
  Future<void> refreshInsights() async {
    _insights = await api.getInsights();
    _insightLimits = await api.getInsightLimits();
    notifyListeners();
  }

  Future<void> generateInsights({bool force = false}) async {
    await api.generateInsights(force: force);
    await refreshInsights();
  }

  Future<void> dismissInsight(String id) async {
    await api.dismissInsight(id);
    await refreshInsights();
  }
}

/// Format INR amount (no sign).
String formatINR(double val) {
  final abs = val.abs();
  if (abs >= 10000000) return '₹${(abs / 10000000).toStringAsFixed(1)}Cr';
  if (abs >= 100000) return '₹${(abs / 100000).toStringAsFixed(1)}L';
  return '₹${abs.toStringAsFixed(0)}';
}

/// Format INR with sign.
String formatINRSigned(double val) {
  final prefix = val < 0 ? '-' : '+';
  return '$prefix${formatINR(val)}';
}
