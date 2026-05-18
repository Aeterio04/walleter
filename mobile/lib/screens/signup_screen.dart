import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/app_provider.dart';
import '../widgets/shared_widgets.dart';

/// Signup screen — "CREATE YOUR IDENTITY." with brutalist aesthetic.
class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _signup() async {
    if (_nameController.text.trim().isEmpty ||
        _emailController.text.trim().isEmpty ||
        _passwordController.text.isEmpty) {
      setState(() => _error = 'All fields required');
      return;
    }
    if (_passwordController.text.length < 6) {
      setState(() => _error = 'Password must be at least 6 characters');
      return;
    }
    if (_passwordController.text != _confirmController.text) {
      setState(() => _error = 'Passwords do not match');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await context.read<AppProvider>().signup(
            _nameController.text.trim(),
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
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Watermark
          Positioned.fill(
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

                  const SizedBox(height: 48),

                  // Hero text
                  Text('CREATE YOUR', style: AppFonts.display(size: 38, color: AppColors.text)),
                  Text('IDENTITY.', style: AppFonts.display(size: 38, color: AppColors.primary)),

                  const SizedBox(height: 8),
                  Text(
                    'SYS.AUTH // REGISTRATION',
                    style: AppFonts.label(size: 9, color: AppColors.muted),
                  ),

                  const SizedBox(height: 36),

                  // Name field
                  Text('FULL NAME', style: AppFonts.label(size: 9, color: AppColors.muted)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _nameController,
                    style: AppFonts.sans(size: 14, color: AppColors.text),
                    textCapitalization: TextCapitalization.words,
                    decoration: const InputDecoration(hintText: 'Rahul Sharma'),
                  ),

                  const SizedBox(height: 16),

                  // Email field
                  Text('COLLEGE EMAIL', style: AppFonts.label(size: 9, color: AppColors.muted)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _emailController,
                    style: AppFonts.sans(size: 14, color: AppColors.text),
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(hintText: 'student@college.edu'),
                  ),

                  const SizedBox(height: 16),

                  // Password field
                  Text('PASSWORD', style: AppFonts.label(size: 9, color: AppColors.muted)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _passwordController,
                    style: AppFonts.sans(size: 14, color: AppColors.text),
                    obscureText: true,
                    decoration: const InputDecoration(hintText: 'Min 6 characters'),
                  ),

                  const SizedBox(height: 16),

                  // Confirm password
                  Text('CONFIRM PASSWORD', style: AppFonts.label(size: 9, color: AppColors.muted)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _confirmController,
                    style: AppFonts.sans(size: 14, color: AppColors.text),
                    obscureText: true,
                    decoration: const InputDecoration(hintText: 'Re-type password'),
                    onSubmitted: (_) => _signup(),
                  ),

                  const SizedBox(height: 28),

                  // Error
                  if (_error != null)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        border: Border(left: BorderSide(color: AppColors.danger, width: 3)),
                        color: AppColors.danger.withValues(alpha: 0.05),
                      ),
                      child: Text(_error!, style: AppFonts.sans(size: 12, color: AppColors.danger)),
                    ),

                  // Signup button
                  NeonButton(
                    label: 'CREATE ACCOUNT',
                    loading: _loading,
                    onTap: _signup,
                  ),

                  const SizedBox(height: 20),

                  // Login link
                  Row(
                    children: [
                      Text('EXISTING USER? ', style: AppFonts.label(size: 10, color: AppColors.muted)),
                      GestureDetector(
                        onTap: () => Navigator.of(context).pushReplacementNamed('/login'),
                        child: Text('LOGIN →', style: AppFonts.bold(size: 10, color: AppColors.primary)),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Default plan info
                  Row(
                    children: [
                      Text('DEFAULT PLAN', style: AppFonts.label(size: 9, color: AppColors.muted)),
                      const SizedBox(width: 8),
                      Text('OBSERVER — FREE', style: AppFonts.bold(size: 10, color: AppColors.text)),
                      const Spacer(),
                      Text('UPGRADE ANYTIME →', style: AppFonts.bold(size: 9, color: AppColors.primary)),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
