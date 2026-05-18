class Transaction {
  final String id;
  final String date;
  final String description;
  final double amount;
  final String category;
  final String type; // 'credit' or 'debit'
  final String createdAt;

  Transaction({
    required this.id,
    required this.date,
    required this.description,
    required this.amount,
    required this.category,
    required this.type,
    required this.createdAt,
  });

  bool get isCredit => type == 'credit';
  bool get isDebit => type == 'debit';

  factory Transaction.fromJson(Map<String, dynamic> json) => Transaction(
        id: json['id'] ?? '',
        date: json['date'] ?? '',
        description: json['description'] ?? '',
        amount: (json['amount'] ?? 0).toDouble(),
        category: json['category'] ?? 'Others',
        type: json['type'] ?? 'debit',
        createdAt: json['created_at'] ?? '',
      );

  Map<String, dynamic> toJson() => {
        'date': date,
        'description': description,
        'amount': amount,
        'category': category,
        'type': type,
      };
}
