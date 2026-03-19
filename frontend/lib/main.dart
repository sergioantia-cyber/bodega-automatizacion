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
import 'screens/product_detail_screen.dart';
import 'screens/edit_product_screen.dart';
import 'screens/suppliers_screen.dart';
import 'screens/cash_management_screen.dart';
import 'screens/clients_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Credenciales reales de Supabase - POS Ureña
  const supabaseUrl = 'https://unilnrmadkjhxweulbfw.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuaWxucm1hZGtqaHh3ZXVsYmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3OTc5ODEsImV4cCI6MjA4OTM3Mzk4MX0.gBVNMc_qB5UTyx9VOhVG0DbLVko6PgCu5NiQQW-Foaw';
  
  await Supabase.initialize(url: supabaseUrl, anonKey: supabaseAnonKey);

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
        '/product_detail': (context) => const ProductDetailScreen(),
        '/edit_product': (context) => const EditProductScreen(),
        '/suppliers': (context) => const SuppliersScreen(),
        '/cash_management': (context) => const CashManagementScreen(),
        '/clients': (context) => const ClientsScreen(),
        // TODO: Agregar rutas de Reportes
      },
    );
  }
}
