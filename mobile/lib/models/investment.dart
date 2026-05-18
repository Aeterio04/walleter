class Investment {
  final String id;
  final String name;
  final String type;
  final double value;
  final String? notes;
  final String dateAdded;
  final String createdAt;

  Investment({
    required this.id,
    required this.name,
    required this.type,
    required this.value,
    this.notes,
    required this.dateAdded,
    required this.createdAt,
  });

  factory Investment.fromJson(Map<String, dynamic> json) => Investment(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        type: json['type'] ?? '',
        value: (json['value'] ?? 0).toDouble(),
        notes: json['notes'],
        dateAdded: json['date_added'] ?? '',
        createdAt: json['created_at'] ?? '',
      );
}
