import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../theme/app_theme.dart';

/// Animated donut chart showing category spending distribution.
class SpendingRing extends StatefulWidget {
  final Map<String, double> categorySpending;
  final double totalSpent;

  const SpendingRing({
    super.key,
    required this.categorySpending,
    required this.totalSpent,
  });

  @override
  State<SpendingRing> createState() => _SpendingRingState();
}

class _SpendingRingState extends State<SpendingRing>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  static const List<Color> _categoryColors = [
    AppColors.primary,
    AppColors.danger,
    Color(0xFF3B82F6),
    Color(0xFF8B5CF6),
    Color(0xFFF59E0B),
    Color(0xFF10B981),
    AppColors.muted,
  ];

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic);
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.categorySpending.isEmpty) {
      return SizedBox(
        height: 160,
        child: Center(
          child: Text('NO DATA', style: AppFonts.label(size: 10, color: AppColors.muted)),
        ),
      );
    }

    final entries = widget.categorySpending.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));

    return AnimatedBuilder(
      animation: _animation,
      builder: (context, _) {
        return SizedBox(
          height: 180,
          child: Row(
            children: [
              // Donut chart
              SizedBox(
                width: 140,
                height: 140,
                child: PieChart(
                  PieChartData(
                    sectionsSpace: 2,
                    centerSpaceRadius: 40,
                    startDegreeOffset: -90,
                    sections: entries.asMap().entries.map((e) {
                      final i = e.key;
                      final entry = e.value;
                      final pct = widget.totalSpent > 0
                          ? entry.value / widget.totalSpent * 100
                          : 0.0;
                      return PieChartSectionData(
                        value: entry.value * _animation.value,
                        color: _categoryColors[i % _categoryColors.length],
                        radius: 20,
                        showTitle: false,
                        badgeWidget: pct > 15
                            ? Text(
                                '${pct.toStringAsFixed(0)}%',
                                style: AppFonts.label(size: 8, color: AppColors.text),
                              )
                            : null,
                        badgePositionPercentageOffset: 1.8,
                      );
                    }).toList(),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              // Legend
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: entries.take(5).toList().asMap().entries.map((e) {
                    final i = e.key;
                    final entry = e.value;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            color: _categoryColors[i % _categoryColors.length],
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              entry.key.toUpperCase(),
                              style: AppFonts.label(size: 8, color: AppColors.muted),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            '₹${entry.value.toStringAsFixed(0)}',
                            style: AppFonts.mono(size: 11, color: AppColors.text),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

/// Animated cash flow sparkline chart.
class CashflowSparkline extends StatelessWidget {
  final List<double> incomeData;
  final List<double> expenseData;
  final double height;

  const CashflowSparkline({
    super.key,
    required this.incomeData,
    required this.expenseData,
    this.height = 120,
  });

  @override
  Widget build(BuildContext context) {
    if (incomeData.isEmpty && expenseData.isEmpty) {
      return SizedBox(
        height: height,
        child: Center(
          child: Text('NO DATA', style: AppFonts.label(size: 10, color: AppColors.muted)),
        ),
      );
    }

    return SizedBox(
      height: height,
      child: LineChart(
        LineChartData(
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: 1000,
            getDrawingHorizontalLine: (value) => FlLine(
              color: AppColors.muted.withValues(alpha: 0.1),
              strokeWidth: 1,
              dashArray: [4, 4],
            ),
          ),
          titlesData: const FlTitlesData(show: false),
          borderData: FlBorderData(show: false),
          lineTouchData: const LineTouchData(enabled: false),
          lineBarsData: [
            // Income line
            LineChartBarData(
              spots: incomeData.asMap().entries
                  .map((e) => FlSpot(e.key.toDouble(), e.value))
                  .toList(),
              isCurved: true,
              color: AppColors.primary,
              barWidth: 2,
              dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(
                show: true,
                color: AppColors.primary.withValues(alpha: 0.05),
              ),
            ),
            // Expense line
            LineChartBarData(
              spots: expenseData.asMap().entries
                  .map((e) => FlSpot(e.key.toDouble(), e.value))
                  .toList(),
              isCurved: true,
              color: AppColors.danger,
              barWidth: 2,
              dotData: const FlDotData(show: false),
              dashArray: [4, 4],
            ),
          ],
        ),
        duration: const Duration(milliseconds: 800),
      ),
    );
  }
}

/// Animated budget progress bar with shimmer on warning/danger.
class CategoryBar extends StatelessWidget {
  final String name;
  final String icon;
  final double spent;
  final double limit;

  const CategoryBar({
    super.key,
    required this.name,
    required this.icon,
    required this.spent,
    required this.limit,
  });

  @override
  Widget build(BuildContext context) {
    final pct = limit > 0 ? (spent / limit).clamp(0.0, 1.5) : 0.0;
    final displayPct = (pct * 100).toStringAsFixed(0);
    final isWarning = pct >= 0.8 && pct < 1.0;
    final isDanger = pct >= 1.0;

    final barColor = isDanger
        ? AppColors.danger
        : isWarning
            ? AppColors.primary
            : AppColors.primary.withValues(alpha: 0.7);

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.muted.withValues(alpha: 0.1))),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Text(icon, style: const TextStyle(fontSize: 16)),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  name.toUpperCase(),
                  style: AppFonts.bold(size: 12, color: AppColors.text),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  border: Border.all(
                    color: isDanger
                        ? AppColors.danger.withValues(alpha: 0.4)
                        : AppColors.muted.withValues(alpha: 0.3),
                  ),
                ),
                child: Text(
                  '$displayPct%',
                  style: AppFonts.mono(
                    size: 9,
                    color: isDanger ? AppColors.danger : AppColors.muted,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                '₹${spent.toStringAsFixed(0)} / ₹${limit.toStringAsFixed(0)}',
                style: AppFonts.mono(size: 11, color: AppColors.muted),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Progress bar
          ClipRect(
            child: SizedBox(
              height: 4,
              child: LayoutBuilder(
                builder: (context, constraints) {
                  return Stack(
                    children: [
                      // Background
                      Container(
                        width: double.infinity,
                        height: 4,
                        color: AppColors.muted.withValues(alpha: 0.15),
                      ),
                      // Fill
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 800),
                        curve: Curves.easeOutCubic,
                        width: constraints.maxWidth * pct.clamp(0.0, 1.0),
                        height: 4,
                        color: barColor,
                      ),
                    ],
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
