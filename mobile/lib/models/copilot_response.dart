class CopilotResponse {
  final bool success;
  final CopilotIntent? intent;
  final CopilotEntities? entities;
  final CopilotReply response;
  final String? error;

  CopilotResponse({
    required this.success,
    this.intent,
    this.entities,
    required this.response,
    this.error,
  });

  factory CopilotResponse.fromJson(Map<String, dynamic> json) => CopilotResponse(
        success: json['success'] ?? false,
        intent: json['intent'] != null ? CopilotIntent.fromJson(json['intent']) : null,
        entities: json['entities'] != null ? CopilotEntities.fromJson(json['entities']) : null,
        response: CopilotReply.fromJson(json['response'] ?? {}),
        error: json['error'],
      );
}

class CopilotIntent {
  final String domain;
  final String action;
  final double confidence;
  final String rawInput;

  CopilotIntent({
    required this.domain,
    required this.action,
    required this.confidence,
    required this.rawInput,
  });

  factory CopilotIntent.fromJson(Map<String, dynamic> json) => CopilotIntent(
        domain: json['domain'] ?? '',
        action: json['action'] ?? '',
        confidence: (json['confidence'] ?? 0).toDouble(),
        rawInput: json['raw_input'] ?? '',
      );
}

class CopilotEntities {
  final double? amount;
  final String? category;
  final String? description;
  final List<String> missing;

  CopilotEntities({
    this.amount,
    this.category,
    this.description,
    required this.missing,
  });

  factory CopilotEntities.fromJson(Map<String, dynamic> json) => CopilotEntities(
        amount: json['amount']?.toDouble(),
        category: json['category'],
        description: json['description'],
        missing: List<String>.from(json['missing'] ?? []),
      );
}

class CopilotReply {
  final String type;
  final String message;
  final Map<String, dynamic>? data;
  final List<CopilotAction> actions;

  CopilotReply({
    required this.type,
    required this.message,
    this.data,
    required this.actions,
  });

  factory CopilotReply.fromJson(Map<String, dynamic> json) => CopilotReply(
        type: json['type'] ?? '',
        message: json['message'] ?? '',
        data: json['data'],
        actions: (json['actions'] as List<dynamic>?)
                ?.map((a) => CopilotAction.fromJson(a))
                .toList() ??
            [],
      );
}

class CopilotAction {
  final String label;
  final String type;
  final dynamic data;

  CopilotAction({
    required this.label,
    required this.type,
    this.data,
  });

  factory CopilotAction.fromJson(Map<String, dynamic> json) => CopilotAction(
        label: json['label'] ?? '',
        type: json['type'] ?? '',
        data: json['data'],
      );
}
