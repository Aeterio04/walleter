import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/app_provider.dart';

/// Animated launch screen with brand reveal.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    // Minimum 2s splash for branding impact
    await Future.delayed(const Duration(milliseconds: 2000));
    if (!mounted) return;

    final provider = context.read<AppProvider>();
    await provider.initialize();

    if (!mounted) return;
    if (provider.isLoggedIn) {
      Navigator.of(context).pushReplacementNamed('/home');
    } else {
      Navigator.of(context).pushReplacementNamed('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Brand name
            Text(
              'WEALTH,',
              style: AppFonts.display(size: 48, color: AppColors.text),
            )
                .animate()
                .fadeIn(duration: 500.ms, curve: Curves.easeOut),

            Text(
              'ARCHITECTED.',
              style: AppFonts.display(size: 48, color: AppColors.primary),
            )
                .animate()
                .fadeIn(duration: 400.ms, delay: 300.ms)
                .slideY(begin: 0.3, duration: 500.ms, curve: Curves.easeOutCubic),

            const SizedBox(height: 32),

            // Scanning line
            SizedBox(
              width: 200,
              height: 2,
              child: Container(
                color: AppColors.primary.withValues(alpha: 0.1),
              )
                  .animate(onPlay: (c) => c.repeat())
                  .shimmer(
                    duration: 1200.ms,
                    color: AppColors.primary.withValues(alpha: 0.6),
                  ),
            ),

            const SizedBox(height: 16),

            Text(
              'INITIALIZING SESSION...',
              style: AppFonts.label(size: 9, color: AppColors.muted.withValues(alpha: 0.5)),
            )
                .animate()
                .fadeIn(delay: 800.ms, duration: 400.ms),
          ],
        ),
      ),
    );
  }
}
