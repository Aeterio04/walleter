import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/app_provider.dart';
import '../widgets/charts/chart_widgets.dart';
import '../config.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final p = context.watch<AppProvider>();
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(slivers: [
        SliverToBoxAdapter(
          child: Container(
            padding: EdgeInsets.fromLTRB(20, MediaQuery.of(context).padding.top + 16, 20, 16),
            decoration: BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.muted.withValues(alpha: 0.2)))),
            child: Row(children: [
              Text('>_ ', style: AppFonts.bold(size: 14, color: AppColors.primary)),
              Text('SETTINGS', style: AppFonts.bold(size: 14, color: AppColors.text)),
            ]),
          ),
        ),

        // Profile section
        SliverToBoxAdapter(child: _section('PROFILE', [
          _row('NAME', p.user?.name ?? '—'),
          _row('EMAIL', p.user?.email ?? '—'),
          _rowWidget('PLAN', Row(children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                border: Border.all(color: p.user?.plan == 'PRO' ? AppColors.primary.withValues(alpha: 0.5) : AppColors.muted.withValues(alpha: 0.3)),
                color: p.user?.plan == 'PRO' ? AppColors.primary.withValues(alpha: 0.1) : Colors.transparent,
              ),
              child: Text(p.user?.plan ?? 'FREE', style: AppFonts.bold(size: 10, color: p.user?.plan == 'PRO' ? AppColors.primary : AppColors.muted)),
            ),
            const SizedBox(width: 12),
            GestureDetector(
              onTap: () { p.togglePlan(); HapticFeedback.mediumImpact(); },
              child: Text(p.user?.plan == 'PRO' ? 'DOWNGRADE →' : 'UPGRADE →', style: AppFonts.bold(size: 9, color: AppColors.primary)),
            ),
          ])),
        ]).animate().fadeIn(duration: 300.ms)),

        // Budgets section
        SliverToBoxAdapter(child: _sectionHeader('BUDGETS')),
        if (p.budgets.isEmpty)
          SliverToBoxAdapter(child: Padding(
            padding: const EdgeInsets.all(20),
            child: Text('NO BUDGETS SET', style: AppFonts.label(size: 10, color: AppColors.muted)),
          ))
        else
          SliverList(delegate: SliverChildBuilderDelegate(
            (ctx, i) => CategoryBar(
              name: p.budgets[i].name,
              icon: p.budgets[i].icon,
              spent: p.budgets[i].spent,
              limit: p.budgets[i].limitAmount,
            ).animate().fadeIn(delay: (i * 100).ms, duration: 300.ms),
            childCount: p.budgets.length,
          )),

        // Investments section
        SliverToBoxAdapter(child: _sectionHeader('INVESTMENTS')),
        SliverToBoxAdapter(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(children: [
              TweenAnimationBuilder<double>(
                tween: Tween(begin: 0, end: p.totalInvested),
                duration: const Duration(milliseconds: 1000),
                curve: Curves.easeOutCubic,
                builder: (_, v, __) => Text('₹${v.toStringAsFixed(0)}', style: AppFonts.display(size: 24, color: AppColors.text)),
              ),
              const SizedBox(width: 12),
              Text('TOTAL • ${p.investments.length} ASSETS', style: AppFonts.label(size: 9, color: AppColors.muted)),
            ]),
          ),
        ),
        if (p.investments.isNotEmpty)
          SliverList(delegate: SliverChildBuilderDelegate(
            (ctx, i) {
              final inv = p.investments[i];
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.muted.withValues(alpha: 0.08)))),
                child: Row(children: [
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(inv.name, style: AppFonts.sans(size: 13, color: AppColors.text)),
                    Text(inv.type.toUpperCase(), style: AppFonts.label(size: 8, color: AppColors.muted)),
                  ])),
                  Text('₹${inv.value.toStringAsFixed(0)}', style: AppFonts.mono(size: 14, color: AppColors.primary)),
                ]),
              ).animate().fadeIn(delay: (i * 80).ms, duration: 300.ms);
            },
            childCount: p.investments.length,
          )),

        // System section
        SliverToBoxAdapter(child: _section('SYSTEM', [
          _rowWidget('BUILD', Text(AppConfig.appVersion, style: AppFonts.mono(size: 11, color: AppColors.muted))),
        ])),

        // Logout button
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: GestureDetector(
              onTap: () async {
                HapticFeedback.heavyImpact();
                await p.logout();
                if (context.mounted) Navigator.of(context).pushReplacementNamed('/login');
              },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(border: Border.all(color: AppColors.danger.withValues(alpha: 0.4))),
                child: Text('TERMINATE SESSION', textAlign: TextAlign.center, style: AppFonts.bold(size: 12, color: AppColors.danger)),
              ),
            ),
          ),
        ),

        const SliverToBoxAdapter(child: SizedBox(height: 100)),
      ]),
    );
  }

  Widget _sectionHeader(String title) => Padding(
    padding: const EdgeInsets.fromLTRB(20, 24, 20, 8),
    child: Row(children: [
      Text('>_ ', style: AppFonts.bold(size: 11, color: AppColors.primary)),
      Text(title, style: AppFonts.bold(size: 11, color: AppColors.text)),
    ]),
  );

  Widget _section(String title, List<Widget> children) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _sectionHeader(title),
      ...children,
    ],
  );

  Widget _row(String label, String value) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
    decoration: BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.muted.withValues(alpha: 0.08)))),
    child: Row(children: [
      Text(label, style: AppFonts.label(size: 9, color: AppColors.muted)),
      const Spacer(),
      Text(value, style: AppFonts.sans(size: 13, color: AppColors.text)),
    ]),
  );

  Widget _rowWidget(String label, Widget child) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
    decoration: BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.muted.withValues(alpha: 0.08)))),
    child: Row(children: [
      Text(label, style: AppFonts.label(size: 9, color: AppColors.muted)),
      const Spacer(),
      child,
    ]),
  );
}
