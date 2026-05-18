import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/app_provider.dart';
import '../widgets/shared_widgets.dart';

/// Expenses screen with filter tabs, transaction list, and swipe-to-delete.
class ExpensesScreen extends StatefulWidget {
  const ExpensesScreen({super.key});

  @override
  State<ExpensesScreen> createState() => _ExpensesScreenState();
}

class _ExpensesScreenState extends State<ExpensesScreen> {
  String _filter = 'all'; // 'all', 'credit', 'debit'

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();

    final filtered = _filter == 'all'
        ? provider.transactions
        : provider.transactions.where((t) => t.type == _filter).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          // Header
          Container(
            padding: EdgeInsets.fromLTRB(20, MediaQuery.of(context).padding.top + 16, 20, 16),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: AppColors.muted.withValues(alpha: 0.2))),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text('>_ ', style: AppFonts.bold(size: 14, color: AppColors.primary)),
                    Text('EXPENSES', style: AppFonts.bold(size: 14, color: AppColors.text)),
                    const Spacer(),
                    Text(
                      '${filtered.length} ENTRIES',
                      style: AppFonts.label(size: 9, color: AppColors.muted),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Filter chips
                Row(
                  children: [
                    _FilterChip('ALL', 'all', _filter, (v) => setState(() => _filter = v)),
                    const SizedBox(width: 8),
                    _FilterChip('INCOME', 'credit', _filter, (v) => setState(() => _filter = v)),
                    const SizedBox(width: 8),
                    _FilterChip('EXPENSE', 'debit', _filter, (v) => setState(() => _filter = v)),
                  ],
                ),
              ],
            ),
          ),

          // Transaction list
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('NO ENTRIES FOUND', style: AppFonts.bold(size: 14, color: AppColors.muted)),
                        const SizedBox(height: 8),
                        Text(
                          'USE CO-PILOT TO ADD TRANSACTIONS',
                          style: AppFonts.label(size: 9, color: AppColors.muted.withValues(alpha: 0.5)),
                        ),
                      ],
                    ),
                  )
                : RefreshIndicator(
                    color: AppColors.primary,
                    backgroundColor: AppColors.surface,
                    onRefresh: () => provider.refreshTransactions(),
                    child: ListView.builder(
                      padding: EdgeInsets.zero,
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        final t = filtered[index];
                        return Dismissible(
                          key: Key(t.id),
                          direction: DismissDirection.endToStart,
                          background: Container(
                            color: AppColors.danger.withValues(alpha: 0.2),
                            alignment: Alignment.centerRight,
                            padding: const EdgeInsets.only(right: 20),
                            child: Text(
                              'DELETE',
                              style: AppFonts.bold(size: 12, color: AppColors.danger),
                            ),
                          ),
                          onDismissed: (_) {
                            HapticFeedback.heavyImpact();
                            provider.deleteTransaction(t.id);
                          },
                          child: TransactionCard(
                            index: index,
                            description: t.description,
                            category: t.category,
                            amount: t.amount,
                            date: t.date,
                            isCredit: t.isCredit,
                          ),
                        ).animate().fadeIn(
                              delay: Duration(milliseconds: (index * 50).clamp(0, 500)),
                              duration: 300.ms,
                            );
                      },
                    ),
                  ),
          ),
        ],
      ),

      // FAB to add expense manually
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.background,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        onPressed: () => _showAddExpenseModal(context, provider),
        child: const Icon(Icons.add, size: 28),
      ),
    );
  }

  void _showAddExpenseModal(BuildContext context, AppProvider provider) {
    final descController = TextEditingController();
    final amountController = TextEditingController();
    String selectedCategory = 'Food';
    String selectedType = 'debit';

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
        child: StatefulBuilder(
          builder: (context, setModalState) => Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('>_ ADD ENTRY', style: AppFonts.bold(size: 14, color: AppColors.primary)),
              const SizedBox(height: 20),

              Text('DESCRIPTION', style: AppFonts.label(size: 9, color: AppColors.muted)),
              const SizedBox(height: 6),
              TextField(
                controller: descController,
                style: AppFonts.sans(size: 14, color: AppColors.text),
                decoration: const InputDecoration(hintText: 'Lunch at canteen'),
              ),

              const SizedBox(height: 16),
              Text('AMOUNT (₹)', style: AppFonts.label(size: 9, color: AppColors.muted)),
              const SizedBox(height: 6),
              TextField(
                controller: amountController,
                style: AppFonts.sans(size: 14, color: AppColors.text),
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(hintText: '200'),
              ),

              const SizedBox(height: 16),
              Text('TYPE', style: AppFonts.label(size: 9, color: AppColors.muted)),
              const SizedBox(height: 6),
              Row(
                children: [
                  _TypeChip('EXPENSE', 'debit', selectedType, (v) => setModalState(() => selectedType = v)),
                  const SizedBox(width: 8),
                  _TypeChip('INCOME', 'credit', selectedType, (v) => setModalState(() => selectedType = v)),
                ],
              ),

              const SizedBox(height: 16),
              Text('CATEGORY', style: AppFonts.label(size: 9, color: AppColors.muted)),
              const SizedBox(height: 6),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: ['Food', 'Transport', 'Stationery', 'Entertainment', 'Subscriptions', 'Others']
                    .map((cat) => _CategoryChip(cat, selectedCategory, (v) => setModalState(() => selectedCategory = v)))
                    .toList(),
              ),

              const SizedBox(height: 24),
              NeonButton(
                label: 'ADD ENTRY',
                onTap: () {
                  if (descController.text.isEmpty || amountController.text.isEmpty) return;
                  final amount = double.tryParse(amountController.text);
                  if (amount == null || amount <= 0) return;

                  provider.addTransaction({
                    'date': DateTime.now().toIso8601String().split('T')[0],
                    'description': descController.text,
                    'amount': amount,
                    'category': selectedCategory,
                    'type': selectedType,
                  });
                  Navigator.pop(ctx);
                  HapticFeedback.mediumImpact();
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final String value;
  final String selected;
  final ValueChanged<String> onTap;

  const _FilterChip(this.label, this.value, this.selected, this.onTap);

  @override
  Widget build(BuildContext context) {
    final isActive = value == selected;
    return GestureDetector(
      onTap: () => onTap(value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary : Colors.transparent,
          border: Border.all(
            color: isActive ? AppColors.primary : AppColors.muted.withValues(alpha: 0.3),
          ),
        ),
        child: Text(
          label,
          style: AppFonts.bold(
            size: 10,
            color: isActive ? AppColors.background : AppColors.muted,
          ),
        ),
      ),
    );
  }
}

class _TypeChip extends StatelessWidget {
  final String label;
  final String value;
  final String selected;
  final ValueChanged<String> onTap;

  const _TypeChip(this.label, this.value, this.selected, this.onTap);

  @override
  Widget build(BuildContext context) {
    final isActive = value == selected;
    return GestureDetector(
      onTap: () => onTap(value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isActive
              ? (value == 'credit' ? AppColors.primary : AppColors.danger)
              : Colors.transparent,
          border: Border.all(
            color: isActive
                ? (value == 'credit' ? AppColors.primary : AppColors.danger)
                : AppColors.muted.withValues(alpha: 0.3),
          ),
        ),
        child: Text(
          label,
          style: AppFonts.bold(
            size: 10,
            color: isActive ? AppColors.background : AppColors.muted,
          ),
        ),
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  final String label;
  final String selected;
  final ValueChanged<String> onTap;

  const _CategoryChip(this.label, this.selected, this.onTap);

  @override
  Widget build(BuildContext context) {
    final isActive = label == selected;
    return GestureDetector(
      onTap: () => onTap(label),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary.withValues(alpha: 0.15) : Colors.transparent,
          border: Border.all(
            color: isActive ? AppColors.primary.withValues(alpha: 0.5) : AppColors.muted.withValues(alpha: 0.2),
          ),
        ),
        child: Text(
          label.toUpperCase(),
          style: AppFonts.bold(
            size: 9,
            color: isActive ? AppColors.primary : AppColors.muted,
          ),
        ),
      ),
    );
  }
}
