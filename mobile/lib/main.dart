import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'theme/app_theme.dart';
import 'services/storage_service.dart';
import 'services/api_service.dart';
import 'providers/app_provider.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/home_shell.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock to portrait
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

  // Dark status bar
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: AppColors.surface,
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  // Initialize storage
  final storage = await StorageService.getInstance();
  final api = ApiService(storage);
  final provider = AppProvider(api: api, storage: storage);

  runApp(WalleterApp(provider: provider));
}

class WalleterApp extends StatelessWidget {
  final AppProvider provider;
  const WalleterApp({super.key, required this.provider});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: provider,
      child: MaterialApp(
        title: 'Walleter',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.dark,
        initialRoute: '/',
        routes: {
          '/': (_) => const SplashScreen(),
          '/login': (_) => const LoginScreen(),
          '/signup': (_) => const SignupScreen(),
          '/home': (_) => const HomeShell(),
        },
        // Animated route transitions
        onGenerateRoute: (settings) {
          Widget page;
          switch (settings.name) {
            case '/':
              page = const SplashScreen();
              break;
            case '/login':
              page = const LoginScreen();
              break;
            case '/signup':
              page = const SignupScreen();
              break;
            case '/home':
              page = const HomeShell();
              break;
            default:
              page = const SplashScreen();
          }
          return PageRouteBuilder(
            settings: settings,
            pageBuilder: (_, __, ___) => page,
            transitionsBuilder: (_, animation, __, child) {
              // Fade transition for auth → home
              if (settings.name == '/home') {
                return FadeTransition(opacity: animation, child: child);
              }
              // Slide transition for auth screens
              return SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(1.0, 0.0),
                  end: Offset.zero,
                ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
                child: child,
              );
            },
            transitionDuration: const Duration(milliseconds: 300),
          );
        },
      ),
    );
  }
}
