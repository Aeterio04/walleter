import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Design system ported 1:1 from the web app's CSS variables.
class AppColors {
  static const Color primary = Color(0xFFCCFF00);
  static const Color background = Color(0xFF09090B);
  static const Color surface = Color(0xFF18181B);
  static const Color text = Color(0xFFF4F4F5);
  static const Color muted = Color(0xFF71717A);
  static const Color danger = Color(0xFFFA114F);
  static const Color primaryDim = Color(0x40CCFF00);
  static const Color mutedDim = Color(0x4D71717A);
  static const Color surfaceLight = Color(0xFF27272A);
}

class AppFonts {
  static TextStyle display({double size = 32, Color? color}) =>
      GoogleFonts.archivoBlack(
        fontSize: size,
        color: color ?? AppColors.text,
        height: 1.0,
      );

  static TextStyle bold({double size = 14, Color? color}) =>
      GoogleFonts.leagueSpartan(
        fontSize: size,
        fontWeight: FontWeight.w700,
        color: color ?? AppColors.text,
        letterSpacing: 0.5,
      );

  static TextStyle sans({double size = 14, Color? color, FontWeight? weight}) =>
      GoogleFonts.spaceGrotesk(
        fontSize: size,
        fontWeight: weight ?? FontWeight.w400,
        color: color ?? AppColors.text,
      );

  static TextStyle label({double size = 9, Color? color}) =>
      GoogleFonts.spaceGrotesk(
        fontSize: size,
        fontWeight: FontWeight.w600,
        color: color ?? AppColors.muted,
        letterSpacing: 1.5,
      );

  static TextStyle mono({double size = 12, Color? color}) =>
      GoogleFonts.spaceGrotesk(
        fontSize: size,
        fontWeight: FontWeight.w500,
        color: color ?? AppColors.text,
        fontFeatures: const [FontFeature.tabularFigures()],
      );
}

class AppTheme {
  static ThemeData get dark => ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.background,
        colorScheme: const ColorScheme.dark(
          primary: AppColors.primary,
          surface: AppColors.surface,
          error: AppColors.danger,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.background,
          elevation: 0,
          scrolledUnderElevation: 0,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.surface,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.zero,
            borderSide: BorderSide(color: AppColors.muted.withValues(alpha: 0.3)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.zero,
            borderSide: BorderSide(color: AppColors.muted.withValues(alpha: 0.3)),
          ),
          focusedBorder: const OutlineInputBorder(
            borderRadius: BorderRadius.zero,
            borderSide: BorderSide(color: AppColors.primary, width: 1),
          ),
          hintStyle: AppFonts.sans(size: 13, color: AppColors.muted.withValues(alpha: 0.5)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: AppColors.background,
            shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
            elevation: 0,
            textStyle: AppFonts.bold(size: 13, color: AppColors.background),
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: AppColors.primary,
            shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
            textStyle: AppFonts.bold(size: 11, color: AppColors.primary),
          ),
        ),
        dividerTheme: DividerThemeData(
          color: AppColors.muted.withValues(alpha: 0.2),
          thickness: 1,
          space: 0,
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: AppColors.surface,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: AppColors.muted,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
        ),
      );
}
