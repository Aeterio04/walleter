class Budget {
  final String id;
  final String name;
  final String icon;
  final double limitAmount;
  final bool locked;
  final double spent;
  final String createdAt;

  Budget({
    required this.id,
    required this.name,
    required this.icon,
    required this.limitAmount,
    required this.locked,
    required this.spent,
    required this.createdAt,
  });

  double get percentage => limitAmount > 0 ? (spent / limitAmount * 100) : 0;
  bool get isWarning => percentage >= 80 && percentage < 100;
  bool get isDanger => percentage >= 100;

  factory Budget.fromJson(Map<String, dynamic> json) => Budget(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        icon: json['icon'] ?? '💵',
        limitAmount: (json['limit_amount'] ?? 0).toDouble(),
        locked: json['locked'] ?? false,
        spent: (json['spent'] ?? 0).toDouble(),
        createdAt: json['created_at'] ?? '',
      );
}
