/// API configuration constants for the Walleter app.
class AppConfig {
  // Android emulator → host machine loopback
  static const String apiBaseUrl = 'http://10.0.2.2:8000';

  // Token storage keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';

  // App metadata
  static const String appVersion = 'WA-V2.4.1';
  static const String buildId = 'MOBILE-001';
}
