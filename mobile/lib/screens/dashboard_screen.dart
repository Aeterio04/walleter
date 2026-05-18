import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/app_provider.dart';
import '../widgets/shared_widgets.dart';
import '../widgets/charts/chart_widgets.dart';

/// Dashboard overview screen with balance, charts, and recent entries.
class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();

    // Build sparkline data from transactions
    final incomeByMonth = <double>[];
    final expenseByMonth = <double>[];
    final monthMap = <int, double>{};
    final expMonthMap = <int, double>{};

    for (final t in provider.transactions) {
      try {
        final date = DateTime.parse(t.date);
        final month = date.month;
        if (t.isCredit) {
          monthMap[month] = (monthMap[month] ?? 0) + t.amount;
        } else {
          expMonthMap[month] = (expMonthMap[month] ?? 0) + t.amount;
        }
      } catch (_) {}
    }

    for (int m = 1; m <= 12; m++) {
      incomeByMonth.add(monthMap[m] ?? 0);
      expenseByMonth.add(expMonthMap[m] ?? 0);
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        color: AppColors.primary,
        backgroundColor: AppColors.surface,
        onRefresh: () => provider.loadUserData(),
        child: CustomScrollView(
          slivers: [
            // Header
            SliverToBoxAdapter(
              child: Container(
                padding: EdgeInsets.fromLTRB(20, MediaQuery.of(context).padding.top + 16, 20, 0),
                child: Row(
                  children: [
                    Text('>_ ', style: AppFonts.bold(size: 14, color: AppColors.primary)),
                    Text('DASHBOARD', style: AppFonts.bold(size: 14, color: AppColors.text)),
                    const Spacer(),
                    Text(
                      'SYS.LOG // OVERVIEW',
                      style: AppFonts.label(size: 8, color: AppColors.muted),
                    ),
                  ],
                ),
              ),
            ),

            // Balance card
            SliverToBoxAdapter(
              child: BalanceHeader(
                balance: provider.balance,
                totalCredit: provider.totalCredit,
                totalDebit: provider.totalDebit,
                totalInvested: provider.totalInvested,
                plan: provider.user?.plan,
              ),
            ),

            // Cash flow chart section
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          'CASH FLOW — INCOME VS. SPENDING',
                          style: AppFonts.label(size: 9, color: AppColors.muted),
                        ),
                        const Spacer(),
                        Container(width: 12, height: 2, color: AppColors.primary),
                        const SizedBox(width: 4),
                        Text('INCOME', style: AppFonts.label(size: 7, color: AppColors.muted)),
                        const SizedBox(width: 8),
                        Container(width: 12, height: 2, color: AppColors.danger),
                        const SizedBox(width: 4),
                        Text('EXPENSE', style: AppFonts.label(size: 7, color: AppColors.muted)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    CashflowSparkline(
                      incomeData: incomeByMonth,
                      expenseData: expenseByMonth,
                    ),
                  ],
                ),
              ).animate().fadeIn(delay: 200.ms, duration: 400.ms),
            ),

            // Category spending ring
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '>_ CATEGORY BREAKDOWN',
                      style: AppFonts.label(size: 9, color: AppColors.muted),
                    ),
                    const SizedBox(height: 12),
                    SpendingRing(
                      categorySpending: provider.categorySpending,
                      totalSpent: provider.totalDebit,
                    ),
                  ],
                ),
              ).animate().fadeIn(delay: 400.ms, duration: 400.ms),
            ),

            // Recent entries header
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
                child: Row(
                  children: [
                    Text(
                      '>_ RECENT ENTRIES',
                      style: AppFonts.label(size: 9, color: AppColors.muted),
                    ),
                    const Spacer(),
                    Text(
                      'VIEW ALL (${provider.transactions.length}) →',
                      style: AppFonts.bold(size: 9, color: AppColors.primary),
                    ),
                  ],
                ),
              ),
            ),

            // Recent transactions
            if (provider.recentTransactions.isEmpty)
              SliverToBoxAdapter(
                child: Container(
                  padding: const EdgeInsets.all(40),
                  child: Center(
                    child: Column(
                      children: [
                        Text(
                          'NO ENTRIES FOUND',
                          style: AppFonts.bold(size: 12, color: AppColors.muted),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'USE CO-PILOT TO ADD TRANSACTIONS',
                          style: AppFonts.label(size: 9, color: AppColors.muted.withValues(alpha: 0.5)),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            else
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final t = provider.recentTransactions[index];
                    return TransactionCard(
                      index: index,
                      description: t.description,
                      category: t.category,
                      amount: t.amount,
                      date: t.date,
                      isCredit: t.isCredit,
                    ).animate().fadeIn(delay: (500 + index * 100).ms, duration: 300.ms);
                  },
                  childCount: provider.recentTransactions.length,
                ),
              ),

            // Investment status
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '>_ INVESTMENT STATUS',
                      style: AppFonts.label(size: 9, color: AppColors.muted),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        TweenAnimationBuilder<double>(
                          tween: Tween(begin: 0, end: provider.totalInvested),
                          duration: const Duration(milliseconds: 1000),
                          curve: Curves.easeOutCubic,
                          builder: (_, value, __) => Text(
                            '₹${value.toStringAsFixed(0)}',
                            style: AppFonts.display(size: 24, color: AppColors.text),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('TOTAL INVESTED', style: AppFonts.label(size: 8, color: AppColors.muted)),
                            Text('${provider.investments.length} ASSETS', style: AppFonts.label(size: 8, color: AppColors.muted)),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ).animate().fadeIn(delay: 600.ms, duration: 400.ms),
            ),

            // Bottom spacing
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }
}
