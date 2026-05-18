import 'package:shared_preferences/shared_preferences.dart';
import '../config.dart';

/// Thin wrapper around SharedPreferences for token persistence.
class StorageService {
  static StorageService? _instance;
  late SharedPreferences _prefs;

  StorageService._();

  static Future<StorageService> getInstance() async {
    if (_instance == null) {
      _instance = StorageService._();
      _instance!._prefs = await SharedPreferences.getInstance();
    }
    return _instance!;
  }

  // ── Token Management ──
  String? get accessToken => _prefs.getString(AppConfig.accessTokenKey);
  String? get refreshToken => _prefs.getString(AppConfig.refreshTokenKey);

  Future<void> setTokens(String accessToken, String refreshToken) async {
    await _prefs.setString(AppConfig.accessTokenKey, accessToken);
    await _prefs.setString(AppConfig.refreshTokenKey, refreshToken);
  }

  Future<void> setAccessToken(String token) async {
    await _prefs.setString(AppConfig.accessTokenKey, token);
  }

  Future<void> clearTokens() async {
    await _prefs.remove(AppConfig.accessTokenKey);
    await _prefs.remove(AppConfig.refreshTokenKey);
  }

  bool get isLoggedIn => accessToken != null && accessToken!.isNotEmpty;
}
