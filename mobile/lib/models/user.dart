class User {
  final String id;
  final String name;
  final String email;
  final String plan; // 'FREE' or 'PRO'
  final double emergencyFund;
  final double emergencyTarget;
  final String createdAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.plan,
    required this.emergencyFund,
    required this.emergencyTarget,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        email: json['email'] ?? '',
        plan: json['plan'] ?? 'FREE',
        emergencyFund: (json['emergency_fund'] ?? 0).toDouble(),
        emergencyTarget: (json['emergency_target'] ?? 15000).toDouble(),
        createdAt: json['created_at'] ?? '',
      );
}

class AuthResponse {
  final String accessToken;
  final String refreshToken;
  final String tokenType;

  AuthResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.tokenType,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) => AuthResponse(
        accessToken: json['access_token'] ?? '',
        refreshToken: json['refresh_token'] ?? '',
        tokenType: json['token_type'] ?? 'bearer',
      );
}
