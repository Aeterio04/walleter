import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/app_provider.dart';
import '../widgets/shared_widgets.dart';

class InsightsScreen extends StatefulWidget {
  const InsightsScreen({super.key});
  @override
  State<InsightsScreen> createState() => _InsightsScreenState();
}

class _InsightsScreenState extends State<InsightsScreen> {
  bool _generating = false;

  Future<void> _generate() async {
    setState(() => _generating = true);
    try {
      await context.read<AppProvider>().generateInsights();
      HapticFeedback.mediumImpact();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(e.toString()),
          backgroundColor: AppColors.danger,
        ));
      }
    } finally {
      if (mounted) setState(() => _generating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = context.watch<AppProvider>();
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(children: [
        Container(
          padding: EdgeInsets.fromLTRB(20, MediaQuery.of(context).padding.top + 16, 20, 16),
          decoration: BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.muted.withValues(alpha: 0.2)))),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text('>_ ', style: AppFonts.bold(size: 14, color: AppColors.primary)),
              Text('AI INSIGHTS', style: AppFonts.bold(size: 14, color: AppColors.text)),
              const Spacer(),
              if (p.insightLimits != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(border: Border.all(color: AppColors.muted.withValues(alpha: 0.3))),
                  child: Text('${p.insightLimits!.remaining}/${p.insightLimits!.limit} LEFT', style: AppFonts.mono(size: 9, color: AppColors.muted)),
                ),
            ]),
            const SizedBox(height: 12),
            GestureDetector(
              onTap: _generating ? null : _generate,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(border: Border.all(color: AppColors.primary.withValues(alpha: 0.4)), color: AppColors.primary.withValues(alpha: 0.05)),
                child: _generating
                    ? Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                        SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 1.5, color: AppColors.primary)),
                        const SizedBox(width: 8),
                        Text('GENERATING...', style: AppFonts.bold(size: 10, color: AppColors.primary)),
                      ])
                    : Text('⚡ GENERATE NEW INSIGHTS', textAlign: TextAlign.center, style: AppFonts.bold(size: 11, color: AppColors.primary)),
              ),
            ),
          ]),
        ),
        Expanded(
          child: p.insights.isEmpty
              ? Center(child: Text('NO ACTIVE INSIGHTS\nGENERATE ABOVE', textAlign: TextAlign.center, style: AppFonts.bold(size: 12, color: AppColors.muted)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: p.insights.length,
                  itemBuilder: (ctx, i) {
                    final ins = p.insights[i];
                    return Dismissible(
                      key: Key(ins.id),
                      direction: DismissDirection.endToStart,
                      background: Container(color: AppColors.muted.withValues(alpha: 0.1), alignment: Alignment.centerRight, padding: const EdgeInsets.only(right: 20), child: Text('DISMISS', style: AppFonts.bold(size: 12, color: AppColors.muted))),
                      onDismissed: (_) { HapticFeedback.mediumImpact(); p.dismissInsight(ins.id); },
                      child: InsightCard(tag: ins.tag, headline: ins.headline, body: ins.body, conclusion: ins.conclusion, highlightStat: ins.highlightStat, onDismiss: () => p.dismissInsight(ins.id)),
                    ).animate().fadeIn(delay: (i * 150).ms, duration: 400.ms).slideY(begin: 0.08, delay: (i * 150).ms, duration: 400.ms, curve: Curves.easeOutCubic);
                  },
                ),
        ),
      ]),
    );
  }
}
