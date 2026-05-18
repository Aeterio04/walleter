import 'dart:convert';

class AIInsight {
  final String id;
  final String tag;
  final String headline;
  final String contentRaw; // JSON string
  final bool dismissed;
  final String? dismissedAt;
  final String createdAt;

  AIInsight({
    required this.id,
    required this.tag,
    required this.headline,
    required this.contentRaw,
    required this.dismissed,
    this.dismissedAt,
    required this.createdAt,
  });

  /// Parsed content fields
  Map<String, dynamic> get content {
    try {
      return jsonDecode(contentRaw);
    } catch (_) {
      return {};
    }
  }

  List<String> get body => List<String>.from(content['body'] ?? []);
  String get conclusion => content['conclusion'] ?? '';
  String get highlightStat => content['highlight_stat'] ?? '';

  factory AIInsight.fromJson(Map<String, dynamic> json) => AIInsight(
        id: json['id'] ?? '',
        tag: json['tag'] ?? '',
        headline: json['headline'] ?? '',
        contentRaw: json['content'] ?? '{}',
        dismissed: json['dismissed'] ?? false,
        dismissedAt: json['dismissed_at'],
        createdAt: json['created_at'] ?? '',
      );
}

class InsightLimits {
  final String plan;
  final int limit;
  final String period;
  final int used;
  final int remaining;

  InsightLimits({
    required this.plan,
    required this.limit,
    required this.period,
    required this.used,
    required this.remaining,
  });

  factory InsightLimits.fromJson(Map<String, dynamic> json) => InsightLimits(
        plan: json['plan'] ?? 'FREE',
        limit: json['limit'] ?? 3,
        period: json['period'] ?? 'month',
        used: json['used'] ?? 0,
        remaining: json['remaining'] ?? 3,
      );
}
