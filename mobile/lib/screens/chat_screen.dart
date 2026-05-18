import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/app_provider.dart';
import '../models/copilot_response.dart';
import '../widgets/chat/chat_widgets.dart';

/// Chat message model for local display.
class _ChatMessage {
  final String id;
  final String role; // 'user', 'assistant', 'system'
  final String content;
  final DateTime timestamp;
  final List<CopilotAction> actions;

  _ChatMessage({
    required this.id,
    required this.role,
    required this.content,
    required this.timestamp,
    this.actions = const [],
  });
}

/// ⭐ CENTRAL HOME SCREEN — Agent-first chat interface.
class ChatScreen extends StatefulWidget {
  final void Function(int)? onNavigateTab;

  const ChatScreen({super.key, this.onNavigateTab});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _inputController = TextEditingController();
  final _scrollController = ScrollController();
  bool _isTyping = false;

  final List<_ChatMessage> _messages = [
    _ChatMessage(
      id: '0',
      role: 'system',
      content:
          'WALLETER CO-PILOT INITIALIZED.\n\nI can help you track expenses, manage budgets, and analyze spending patterns.\n\nTry: "spent 200 on lunch" or "show budgets"\n\nType \'help\' for all commands.',
      timestamp: DateTime.now(),
    ),
  ];

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOutCubic,
        );
      }
    });
  }

  Future<void> _sendMessage([String? preset]) async {
    final text = preset ?? _inputController.text.trim();
    if (text.isEmpty) return;

    // Add user message
    setState(() {
      _messages.add(_ChatMessage(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        role: 'user',
        content: text,
        timestamp: DateTime.now(),
      ));
      _isTyping = true;
    });
    _inputController.clear();
    _scrollToBottom();
    HapticFeedback.lightImpact();

    try {
      final provider = context.read<AppProvider>();
      final response = await provider.api.sendCopilotMessage(text);

      setState(() {
        _isTyping = false;
        _messages.add(_ChatMessage(
          id: (DateTime.now().millisecondsSinceEpoch + 1).toString(),
          role: 'assistant',
          content: response.response.message,
          timestamp: DateTime.now(),
          actions: response.response.actions,
        ));
      });

      // Refresh data if the agent modified something
      if (response.response.type == 'success') {
        await provider.refreshTransactions();
        await provider.refreshBudgets();
      }

      HapticFeedback.mediumImpact();
    } catch (e) {
      setState(() {
        _isTyping = false;
        _messages.add(_ChatMessage(
          id: (DateTime.now().millisecondsSinceEpoch + 1).toString(),
          role: 'system',
          content: '⚠ ERROR: ${e.toString()}',
          timestamp: DateTime.now(),
        ));
      });
    }
    _scrollToBottom();
  }

  void _handleAction(CopilotAction action) {
    if (action.type == 'navigate' && action.data != null) {
      // Map routes to tab indices
      final tabMap = {
        '/dashboard': 0,
        '/expenses': 1,
        '/insights': 3,
        '/budget': 4,
        '/investments': 4,
        '/settings': 4,
      };
      final tabIndex = tabMap[action.data];
      if (tabIndex != null && widget.onNavigateTab != null) {
        widget.onNavigateTab!(tabIndex);
      }
    } else if (action.type == 'help') {
      _sendMessage('help');
    }
    HapticFeedback.selectionClick();
  }

  void _handleQuickAction(String command) {
    // Map quick action labels to actual copilot commands
    final commandMap = {
      'add expense': 'add expense',
      'view balance': 'show dashboard',
      'show budgets': 'show budgets',
      'ai insights': 'show insights',
      'help': 'help',
    };
    final mapped = commandMap[command] ?? command;
    _sendMessage(mapped);
  }

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();

    return Column(
      children: [
        // ── Header with balance ──
        Container(
          padding: EdgeInsets.fromLTRB(20, MediaQuery.of(context).padding.top + 12, 20, 16),
          decoration: BoxDecoration(
            color: AppColors.background,
            border: Border(bottom: BorderSide(color: AppColors.muted.withValues(alpha: 0.2))),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('⚡', style: const TextStyle(fontSize: 16)),
                  const SizedBox(width: 8),
                  Text(
                    'WALLETER CO-PILOT',
                    style: AppFonts.display(size: 16, color: AppColors.primary),
                  ),
                  const Spacer(),
                  // Active indicator
                  Container(
                    width: 6,
                    height: 6,
                    color: AppColors.primary,
                  )
                      .animate(onPlay: (c) => c.repeat())
                      .fadeIn(duration: 800.ms)
                      .then()
                      .fadeOut(duration: 800.ms),
                  const SizedBox(width: 6),
                  Text('ACTIVE', style: AppFonts.label(size: 8, color: AppColors.muted)),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0, end: provider.balance),
                    duration: const Duration(milliseconds: 1000),
                    curve: Curves.easeOutCubic,
                    builder: (_, value, __) => Text(
                      '₹${value.toStringAsFixed(0)}',
                      style: AppFonts.display(size: 28, color: AppColors.text),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text('BALANCE', style: AppFonts.label(size: 8, color: AppColors.muted)),
                  const Spacer(),
                  if (provider.user != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: provider.user!.plan == 'PRO'
                              ? AppColors.primary.withValues(alpha: 0.4)
                              : AppColors.muted.withValues(alpha: 0.3),
                        ),
                      ),
                      child: Text(
                        provider.user!.plan,
                        style: AppFonts.bold(
                          size: 9,
                          color: provider.user!.plan == 'PRO'
                              ? AppColors.primary
                              : AppColors.muted,
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ).animate().fadeIn(duration: 300.ms),

        // ── Chat messages ──
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.fromLTRB(16, 16, 0, 8),
            itemCount: _messages.length + (_isTyping ? 1 : 0),
            itemBuilder: (context, index) {
              if (index == _messages.length && _isTyping) {
                return const ThinkingIndicator();
              }
              final msg = _messages[index];
              return ChatBubble(
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp,
                actions: msg.actions,
                onAction: _handleAction,
              )
                  .animate()
                  .fadeIn(duration: 250.ms)
                  .slideY(begin: 0.1, duration: 250.ms, curve: Curves.easeOutCubic);
            },
          ),
        ),

        // ── Quick actions ──
        Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            border: Border(top: BorderSide(color: AppColors.muted.withValues(alpha: 0.1))),
          ),
          child: QuickActionPills(onTap: _handleQuickAction),
        ),

        // ── Input ──
        TerminalInput(
          controller: _inputController,
          onSend: () => _sendMessage(),
          messageCount: _messages.length,
        ),
      ],
    );
  }
}
