import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_theme.dart';

/// Animated balance header with count-up animation.
class BalanceHeader extends StatelessWidget {
  final double balance;
  final double totalCredit;
  final double totalDebit;
  final double totalInvested;
  final String? plan;

  const BalanceHeader({
    super.key,
    required this.balance,
    required this.totalCredit,
    required this.totalDebit,
    required this.totalInvested,
    this.plan,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.muted.withValues(alpha: 0.2))),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '>_ CURRENT BALANCE',
                      style: AppFonts.label(size: 9, color: AppColors.muted),
                    ),
                    const SizedBox(height: 4),
                    TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0, end: balance),
                      duration: const Duration(milliseconds: 1200),
                      curve: Curves.easeOutCubic,
                      builder: (_, value, __) => Text(
                        '₹${value.toStringAsFixed(0)}',
                        style: AppFonts.display(size: 36, color: AppColors.text),
                      ),
                    ),
                  ],
                ),
              ),
              if (plan != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: plan == 'PRO'
                          ? AppColors.primary.withValues(alpha: 0.5)
                          : AppColors.muted.withValues(alpha: 0.3),
                    ),
                    color: plan == 'PRO'
                        ? AppColors.primary.withValues(alpha: 0.1)
                        : Colors.transparent,
                  ),
                  child: Text(
                    plan!,
                    style: AppFonts.bold(
                      size: 9,
                      color: plan == 'PRO' ? AppColors.primary : AppColors.muted,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _StatChip('TOTAL IN', '₹${totalCredit.toStringAsFixed(0)}', AppColors.primary),
              const SizedBox(width: 24),
              _StatChip('TOTAL OUT', '-₹${totalDebit.toStringAsFixed(0)}', AppColors.danger),
              const SizedBox(width: 24),
              _StatChip('INVESTED', '₹${totalInvested.toStringAsFixed(0)}', AppColors.text),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.05, duration: 400.ms);
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatChip(this.label, this.value, this.color);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppFonts.label(size: 8, color: AppColors.muted)),
        const SizedBox(height: 2),
        Text(
          value,
          style: AppFonts.mono(size: 13, color: color),
        ),
      ],
    );
  }
}

/// Transaction card with terminal-row aesthetic and left accent border.
class TransactionCard extends StatelessWidget {
  final int index;
  final String description;
  final String category;
  final double amount;
  final String date;
  final bool isCredit;
  final VoidCallback? onTap;

  const TransactionCard({
    super.key,
    required this.index,
    required this.description,
    required this.category,
    required this.amount,
    required this.date,
    required this.isCredit,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          border: Border(
            left: BorderSide(
              color: isCredit ? AppColors.primary : AppColors.danger,
              width: 3,
            ),
            bottom: BorderSide(color: AppColors.muted.withValues(alpha: 0.08)),
          ),
          color: index.isEven ? AppColors.surface.withValues(alpha: 0.2) : Colors.transparent,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            // Line number gutter
            SizedBox(
              width: 28,
              child: Text(
                '${index + 1}'.padLeft(3, '0'),
                style: AppFonts.mono(size: 10, color: AppColors.muted.withValues(alpha: 0.3)),
              ),
            ),
            const SizedBox(width: 12),
            // Description + category
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    description,
                    style: AppFonts.sans(size: 13, color: AppColors.text),
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '$category • $date',
                    style: AppFonts.label(size: 8, color: AppColors.muted),
                  ),
                ],
              ),
            ),
            // Amount
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '${isCredit ? '+' : '-'}₹${amount.toStringAsFixed(0)}',
                  style: AppFonts.mono(
                    size: 14,
                    color: isCredit ? AppColors.primary : AppColors.danger,
                  ),
                ),
                const SizedBox(height: 2),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: isCredit
                          ? AppColors.primary.withValues(alpha: 0.3)
                          : AppColors.danger.withValues(alpha: 0.25),
                    ),
                    color: isCredit
                        ? AppColors.primary.withValues(alpha: 0.1)
                        : AppColors.danger.withValues(alpha: 0.06),
                  ),
                  child: Text(
                    isCredit ? 'IN' : 'OUT',
                    style: AppFonts.bold(
                      size: 8,
                      color: isCredit ? AppColors.primary : AppColors.danger,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Neon green primary CTA button.
class NeonButton extends StatefulWidget {
  final String label;
  final VoidCallback? onTap;
  final bool loading;
  final bool fullWidth;

  const NeonButton({
    super.key,
    required this.label,
    this.onTap,
    this.loading = false,
    this.fullWidth = true,
  });

  @override
  State<NeonButton> createState() => _NeonButtonState();
}

class _NeonButtonState extends State<NeonButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) {
        setState(() => _pressed = false);
        if (!widget.loading) widget.onTap?.call();
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 50),
        width: widget.fullWidth ? double.infinity : null,
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
        decoration: BoxDecoration(
          color: _pressed ? AppColors.text : AppColors.primary,
        ),
        child: widget.loading
            ? Center(
                child: SizedBox(
                  height: 16,
                  width: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AppColors.background,
                  ),
                ),
              )
            : Text(
                widget.label,
                textAlign: TextAlign.center,
                style: AppFonts.bold(size: 13, color: AppColors.background),
              ),
      ),
    );
  }
}

/// Insight card with brutalist headline and swipe dismiss.
class InsightCard extends StatelessWidget {
  final String tag;
  final String headline;
  final List<String> body;
  final String conclusion;
  final String highlightStat;
  final VoidCallback? onDismiss;

  const InsightCard({
    super.key,
    required this.tag,
    required this.headline,
    required this.body,
    required this.conclusion,
    required this.highlightStat,
    this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.muted.withValues(alpha: 0.2)),
        color: AppColors.surface,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Tag header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: AppColors.primary.withValues(alpha: 0.1),
            child: Text(
              '◆ $tag',
              style: AppFonts.bold(size: 10, color: AppColors.primary),
            ),
          ),
          // Headline
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            child: Text(
              headline,
              style: AppFonts.display(size: 22, color: AppColors.text),
            ),
          ),
          // Body paragraphs
          ...body.map(
            (paragraph) => Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
              child: Text(
                paragraph,
                style: AppFonts.sans(size: 13, color: AppColors.text.withValues(alpha: 0.8)),
              ),
            ),
          ),
          // Conclusion with accent border
          if (conclusion.isNotEmpty)
            Container(
              margin: const EdgeInsets.fromLTRB(16, 4, 16, 16),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                border: Border(
                  left: BorderSide(color: AppColors.primary, width: 3),
                ),
                color: AppColors.primary.withValues(alpha: 0.05),
              ),
              child: Text(
                conclusion,
                style: AppFonts.sans(
                  size: 12,
                  color: AppColors.text.withValues(alpha: 0.9),
                  weight: FontWeight.w500,
                ),
              ),
            ),
          // Dismiss button
          if (onDismiss != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: GestureDetector(
                onTap: onDismiss,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.muted.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    'DISMISS',
                    style: AppFonts.bold(size: 9, color: AppColors.muted),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
