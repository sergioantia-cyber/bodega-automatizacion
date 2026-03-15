import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_fonts/google_fonts.dart';

import 'screens/main_layout.dart';
import 'screens/dashboard.dart';
import 'screens/inventory_screen.dart';
import 'screens/checkout_screen.dart';
import 'screens/expense_screen.dart';
import 'screens/expense_history_screen.dart';
import 'screens/add_product_screen.dart';
import 'screens/close_shift_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Reemplazar con las credenciales reales de Supabase
  const supabaseUrl = 'TU_SUPABASE_URL';
  const supabaseAnonKey = 'TU_SUPABASE_ANON_KEY';
  
  if (supabaseUrl != 'TU_SUPABASE_URL') {
    await Supabase.initialize(url: supabaseUrl, anonKey: supabaseAnonKey);
  }

  runApp(const PosUrenaApp());
}

class PosUrenaApp extends StatelessWidget {
  const PosUrenaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'POS Minimarket Ureña',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0A0A0A), // Deep black
        primaryColor: const Color(0xFF00E5FF), // Neon Cyan
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF00E5FF),
          secondary: Color(0xFFFF00FF), // Neon Magenta
          tertiary: Color(0xFFCCFF00), // Neon Lime
        ),
        textTheme: GoogleFonts.spaceGroteskTextTheme(Theme.of(context).textTheme).apply(
          bodyColor: Colors.white,
          displayColor: Colors.white,
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const MainLayout(),
        '/dashboard': (context) => const DashboardScreen(),
        '/inventory': (context) => const InventoryScreen(),
        '/checkout': (context) => const CheckoutScreen(),
        '/expense': (context) => const ExpenseScreen(),
        '/expense_history': (context) => const ExpenseHistoryScreen(),
        '/add_product': (context) => const AddProductScreen(),
        '/close_shift': (context) => const CloseShiftScreen(),
        // TODO: Agregar rutas de Reportes
      },
    );
  }
}
