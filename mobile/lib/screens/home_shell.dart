import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';
import 'chat_screen.dart';
import 'dashboard_screen.dart';
import 'expenses_screen.dart';
import 'insights_screen.dart';
import 'settings_screen.dart';

/// Main shell with custom bottom navigation bar. Chat tab is central and default.
class HomeShell extends StatefulWidget {
  const HomeShell({super.key});
  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _currentIndex = 2; // Chat is center tab (index 2)
  late PageController _pageController;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: 2);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onTabTap(int index) {
    HapticFeedback.selectionClick();
    setState(() => _currentIndex = index);
    _pageController.animateToPage(
      index,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: PageView(
        controller: _pageController,
        physics: const BouncingScrollPhysics(),
        onPageChanged: (i) => setState(() => _currentIndex = i),
        children: [
          const DashboardScreen(),
          const ExpensesScreen(),
          ChatScreen(onNavigateTab: _onTabTap),
          const InsightsScreen(),
          const SettingsScreen(),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          border: Border(top: BorderSide(color: AppColors.muted.withValues(alpha: 0.2))),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _NavItem(icon: Icons.grid_view_outlined, label: 'DASH', index: 0, current: _currentIndex, onTap: _onTabTap),
                _NavItem(icon: Icons.receipt_long_outlined, label: 'EXPS', index: 1, current: _currentIndex, onTap: _onTabTap),
                _NavItem(icon: Icons.bolt, label: 'CHAT', index: 2, current: _currentIndex, onTap: _onTabTap, isCenter: true),
                _NavItem(icon: Icons.insights_outlined, label: 'AI', index: 3, current: _currentIndex, onTap: _onTabTap),
                _NavItem(icon: Icons.settings_outlined, label: 'SETS', index: 4, current: _currentIndex, onTap: _onTabTap),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final int index;
  final int current;
  final ValueChanged<int> onTap;
  final bool isCenter;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.index,
    required this.current,
    required this.onTap,
    this.isCenter = false,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = index == current;
    return GestureDetector(
      onTap: () => onTap(index),
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 56,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              padding: EdgeInsets.all(isCenter ? 10 : 6),
              decoration: isCenter && isActive
                  ? BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.15),
                      border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                    )
                  : null,
              child: Icon(
                icon,
                size: isCenter ? 24 : 20,
                color: isActive
                    ? AppColors.primary
                    : isCenter
                        ? AppColors.primary.withValues(alpha: 0.5)
                        : AppColors.muted,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: AppFonts.bold(
                size: 8,
                color: isActive ? AppColors.primary : AppColors.muted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
