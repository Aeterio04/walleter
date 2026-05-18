import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../theme/app_theme.dart';
import '../../models/copilot_response.dart';

/// A single chat message bubble with left accent border and optional action buttons.
class ChatBubble extends StatelessWidget {
  final String role; // 'user', 'assistant', 'system'
  final String content;
  final DateTime timestamp;
  final List<CopilotAction> actions;
  final void Function(CopilotAction)? onAction;

  const ChatBubble({
    super.key,
    required this.role,
    required this.content,
    required this.timestamp,
    this.actions = const [],
    this.onAction,
  });

  Color get _accentColor {
    switch (role) {
      case 'assistant':
        return AppColors.primary;
      case 'system':
        return AppColors.danger;
      default:
        return AppColors.muted.withValues(alpha: 0.4);
    }
  }

  String get _roleLabel {
    switch (role) {
      case 'assistant':
        return 'CO-PILOT';
      case 'system':
        return 'SYS';
      default:
        return 'YOU';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: role == 'user' ? 48 : 0,
        right: role == 'user' ? 0 : 24,
        bottom: 12,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: role label + timestamp
          Row(
            children: [
              Text(
                _roleLabel,
                style: AppFonts.label(
                  size: 8,
                  color: role == 'assistant' ? AppColors.primary : AppColors.muted,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                '${timestamp.hour.toString().padLeft(2, '0')}:${timestamp.minute.toString().padLeft(2, '0')}',
                style: AppFonts.label(size: 8, color: AppColors.muted.withValues(alpha: 0.4)),
              ),
            ],
          ),
          const SizedBox(height: 4),

          // Message body with left accent border
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              border: Border(
                left: BorderSide(color: _accentColor, width: 2),
              ),
              color: role == 'user'
                  ? AppColors.surface.withValues(alpha: 0.5)
                  : role == 'system'
                      ? AppColors.muted.withValues(alpha: 0.05)
                      : AppColors.surface.withValues(alpha: 0.3),
            ),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.muted.withValues(alpha: 0.15)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    content,
                    style: AppFonts.sans(size: 13, color: AppColors.text.withValues(alpha: 0.9)),
                  ),

                  // Action buttons
                  if (actions.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Container(
                      height: 1,
                      color: AppColors.muted.withValues(alpha: 0.15),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: actions.map((action) {
                        return GestureDetector(
                          onTap: () => onAction?.call(action),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              border: Border.all(color: AppColors.primary.withValues(alpha: 0.4)),
                            ),
                            child: Text(
                              action.label,
                              style: AppFonts.bold(size: 10, color: AppColors.primary),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Animated thinking indicator with pulsating dots.
class ThinkingIndicator extends StatelessWidget {
  const ThinkingIndicator({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 24, bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'CO-PILOT',
            style: AppFonts.label(size: 8, color: AppColors.primary),
          ),
          const SizedBox(height: 4),
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              border: Border(
                left: BorderSide(color: AppColors.primary, width: 2),
              ),
              color: AppColors.surface.withValues(alpha: 0.3),
            ),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.muted.withValues(alpha: 0.15)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Three animated dots
                  for (int i = 0; i < 3; i++) ...[
                    if (i > 0) const SizedBox(width: 4),
                    Container(
                      width: 6,
                      height: 6,
                      color: AppColors.primary,
                    )
                        .animate(
                          onPlay: (c) => c.repeat(),
                        )
                        .fadeIn(duration: 400.ms, delay: (i * 200).ms)
                        .then()
                        .fadeOut(duration: 400.ms),
                  ],
                  const SizedBox(width: 12),
                  Text(
                    'PROCESSING...',
                    style: AppFonts.label(size: 8, color: AppColors.primary.withValues(alpha: 0.6)),
                  ),
                  const Spacer(),
                  // Scanning line
                  SizedBox(
                    width: 40,
                    height: 2,
                    child: Container(color: AppColors.primary.withValues(alpha: 0.1))
                        .animate(onPlay: (c) => c.repeat())
                        .shimmer(
                          duration: 800.ms,
                          color: AppColors.primary.withValues(alpha: 0.4),
                        ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Horizontal scrollable quick action pills above the chat input.
class QuickActionPills extends StatelessWidget {
  final void Function(String) onTap;

  const QuickActionPills({super.key, required this.onTap});

  static const List<Map<String, String>> _actions = [
    {'label': 'ADD EXPENSE', 'icon': '💰'},
    {'label': 'VIEW BALANCE', 'icon': '📊'},
    {'label': 'SHOW BUDGETS', 'icon': '📋'},
    {'label': 'AI INSIGHTS', 'icon': '📈'},
    {'label': 'HELP', 'icon': '❓'},
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 36,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _actions.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final action = _actions[index];
          return _PillButton(
            label: action['label']!,
            icon: action['icon']!,
            onTap: () => onTap(action['label']!.toLowerCase()),
          );
        },
      ),
    );
  }
}

class _PillButton extends StatefulWidget {
  final String label;
  final String icon;
  final VoidCallback onTap;

  const _PillButton({required this.label, required this.icon, required this.onTap});

  @override
  State<_PillButton> createState() => _PillButtonState();
}

class _PillButtonState extends State<_PillButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) {
        setState(() => _pressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.93 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.muted.withValues(alpha: 0.3)),
            color: AppColors.surface,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(widget.icon, style: const TextStyle(fontSize: 12)),
              const SizedBox(width: 6),
              Text(
                widget.label,
                style: AppFonts.bold(size: 9, color: AppColors.text),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Terminal-style input with ">_" prefix and SEND button.
class TerminalInput extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onSend;
  final bool enabled;
  final int messageCount;

  const TerminalInput({
    super.key,
    required this.controller,
    required this.onSend,
    this.enabled = true,
    this.messageCount = 0,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: AppColors.muted.withValues(alpha: 0.2))),
        color: AppColors.background,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Text('>_', style: AppFonts.bold(size: 14, color: AppColors.primary)),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: controller,
                  enabled: enabled,
                  style: AppFonts.sans(size: 13, color: AppColors.text),
                  textCapitalization: TextCapitalization.characters,
                  decoration: InputDecoration(
                    hintText: 'TYPE COMMAND...',
                    hintStyle: AppFonts.sans(size: 13, color: AppColors.muted.withValues(alpha: 0.4)),
                    filled: false,
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(vertical: 8),
                    isDense: true,
                  ),
                  onSubmitted: (_) => onSend(),
                ),
              ),
              const SizedBox(width: 8),
              ValueListenableBuilder<TextEditingValue>(
                valueListenable: controller,
                builder: (_, value, __) => GestureDetector(
                  onTap: value.text.trim().isEmpty ? null : onSend,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    color: value.text.trim().isEmpty
                        ? AppColors.primary.withValues(alpha: 0.15)
                        : AppColors.primary,
                    child: Text(
                      'SEND',
                      style: AppFonts.bold(
                        size: 11,
                        color: value.text.trim().isEmpty
                            ? AppColors.muted
                            : AppColors.background,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'ENTER TO SEND • NO INVESTMENT ADVICE',
                style: AppFonts.label(size: 7, color: AppColors.muted.withValues(alpha: 0.4)),
              ),
              Text(
                '$messageCount MSG',
                style: AppFonts.label(size: 7, color: AppColors.muted.withValues(alpha: 0.3)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
