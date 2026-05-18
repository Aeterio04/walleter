import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/app_provider.dart';
import '../widgets/shared_widgets.dart';

/// Login screen — "INITIATE SESSION" with brutalist terminal aesthetic.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _login() async {
    if (_emailController.text.trim().isEmpty || _passwordController.text.isEmpty) {
      setState(() => _error = 'All fields required');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await context.read<AppProvider>().login(
            _emailController.text.trim(),
            _passwordController.text,
          );
      if (mounted) Navigator.of(context).pushReplacementNamed('/home');
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Watermark background
          Positioned.fill(
            child: OverflowBox(
              maxWidth: double.infinity,
              child: Opacity(
                opacity: 0.03,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    8,
                    (_) => Text(
                      'WALLETER WALLETER WALLETER',
                      style: AppFonts.display(size: 60, color: AppColors.text),
                      maxLines: 1,
                      overflow: TextOverflow.visible,
                    ),
                  ),
                ),
              ),
            ),
          ),

          // Main content
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 40),

                  // Logo
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('WEALTH', style: AppFonts.display(size: 20, color: AppColors.text)),
                      Text('ARCHITECTED.', style: AppFonts.bold(size: 11, color: AppColors.primary)),
                    ],
                  ).animate().fadeIn(duration: 400.ms),

                  const SizedBox(height: 60),

                  // Hero text
                  Text(
                    'INITIATE\nSESSION.',
                    style: AppFonts.display(size: 42, color: AppColors.text),
                  )
                      .animate()
                      .fadeIn(duration: 500.ms, delay: 200.ms)
                      .slideY(begin: 0.15, duration: 500.ms, curve: Curves.easeOutCubic),

                  const SizedBox(height: 8),

                  Text(
                    'SYS.AUTH // TERMINAL',
                    style: AppFonts.label(size: 9, color: AppColors.muted),
                  ).animate().fadeIn(delay: 400.ms),

                  const SizedBox(height: 48),

                  // Email field
                  Text('EMAIL', style: AppFonts.label(size: 9, color: AppColors.muted)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _emailController,
                    style: AppFonts.sans(size: 14, color: AppColors.text),
                    keyboardType: TextInputType.emailAddress,
                    decoration: InputDecoration(
                      hintText: 'student@college.edu',
                    ),
                  ).animate().fadeIn(delay: 500.ms),

                  const SizedBox(height: 20),

                  // Password field
                  Text('PASSWORD', style: AppFonts.label(size: 9, color: AppColors.muted)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _passwordController,
                    style: AppFonts.sans(size: 14, color: AppColors.text),
                    obscureText: true,
                    decoration: InputDecoration(
                      hintText: '••••••',
                    ),
                    onSubmitted: (_) => _login(),
                  ).animate().fadeIn(delay: 600.ms),

                  const SizedBox(height: 32),

                  // Error
                  if (_error != null)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        border: Border(
                          left: BorderSide(color: AppColors.danger, width: 3),
                        ),
                        color: AppColors.danger.withValues(alpha: 0.05),
                      ),
                      child: Text(_error!, style: AppFonts.sans(size: 12, color: AppColors.danger)),
                    ),

                  // Login button
                  NeonButton(
                    label: 'INITIATE SESSION',
                    loading: _loading,
                    onTap: _login,
                  ).animate().fadeIn(delay: 700.ms),

                  const SizedBox(height: 24),

                  // Signup link
                  Row(
                    children: [
                      Text(
                        'NEW USER? ',
                        style: AppFonts.label(size: 10, color: AppColors.muted),
                      ),
                      GestureDetector(
                        onTap: () => Navigator.of(context).pushReplacementNamed('/signup'),
                        child: Text(
                          'CREATE ACCOUNT →',
                          style: AppFonts.bold(size: 10, color: AppColors.primary),
                        ),
                      ),
                    ],
                  ).animate().fadeIn(delay: 800.ms),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
