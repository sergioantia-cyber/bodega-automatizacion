import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import '../components/glass_card.dart';
import 'package:share_plus/share_plus.dart';
import '../models/product.dart';
import '../models/sale.dart';
import '../services/product_service.dart';
import '../services/sales_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ProductService _productService = ProductService();
  final SalesService _salesService = SalesService();

  double _totalSalesToday = 0.0;
  double _foodStockLevel = 0.0;
  double _drinkStockLevel = 0.0;
  List<Sale> _recentSales = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() => _isLoading = true);
    try {
      // 1. Load Sales
      final sales = await _salesService.getAllSales();
      final now = DateTime.now();
      final todaySales = sales.where((s) {
        if (s.date == null) return false;
        return s.date!.day == now.day && s.date!.month == now.month && s.date!.year == now.year;
      }).toList();

      // 2. Load Products for stock monitoring
      final products = await _productService.getAllProducts();
      
      // Calculate levels
      final foodProducts = products.where((p) => p.category == 'Alimentos').toList();
      final drinkProducts = products.where((p) => p.category == 'Bebidas').toList();

      double calcLevel(List<Product> list) {
        if (list.isEmpty) return 0.0;
        double totalStock = list.fold(0, (sum, p) => sum + p.stock);
        double totalMax = list.fold(0, (sum, p) => sum + p.maxStock);
        return (totalStock / totalMax).clamp(0.0, 1.0);
      }

      setState(() {
        _totalSalesToday = todaySales.fold(0.0, (sum, s) => sum + s.total);
        _recentSales = sales.take(3).toList();
        _foodStockLevel = calcLevel(foodProducts);
        _drinkStockLevel = calcLevel(drinkProducts);
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      print('Error loading dashboard: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    const limeNeon = Color(0xFF8CFF00);
    const cyanNeon = Color(0xFF00FBFF);
    const magentaNeon = Color(0xFFFF00FF);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: RefreshIndicator(
        onRefresh: _loadDashboardData,
        color: cyanNeon,
        backgroundColor: const Color(0xFF141714),
        child: SafeArea(
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                _buildHeader(limeNeon),
                const SizedBox(height: 32),
                _buildSalesChart(cyanNeon, limeNeon),
                const SizedBox(height: 32),
                _buildSectionTitle('ACCIONES RÁPIDAS'),
                const SizedBox(height: 16),
                _buildQuickActions(context, cyanNeon, limeNeon),
                const SizedBox(height: 32),
                _buildSectionTitle('MONITOREO DE STOCK'),
                const SizedBox(height: 16),
                _isLoading 
                  ? const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator()))
                  : _buildInventoryMonitoring(context, limeNeon, magentaNeon),
                const SizedBox(height: 32),
                _buildSectionTitle('ACTIVIDAD RECIENTE'),
                const SizedBox(height: 16),
                _isLoading
                  ? const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator()))
                  : _buildRecentActivity(context, cyanNeon, limeNeon),
                const SizedBox(height: 120),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.orbitron(
        color: Colors.white70,
        fontSize: 10,
        fontWeight: FontWeight.w900,
        letterSpacing: 1.5,
      ),
    );
  }

  Widget _buildHeader(Color accent) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'BIENVENIDO BACK,', 
              style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.0)
            ),
            Text(
              'POS UREÑA', 
              style: GoogleFonts.orbitron(
                fontSize: 26, 
                fontWeight: FontWeight.w900, 
                color: Colors.white,
                letterSpacing: 1.0,
                shadows: [BoxShadow(color: accent.withOpacity(0.3), blurRadius: 10)]
              )
            ),
          ],
        ),
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: const Color(0xFF141714),
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white.withOpacity(0.05)),
          ),
          child: Icon(Icons.person_rounded, color: accent, size: 24),
        ),
      ],
    );
  }

  Widget _buildSalesChart(Color primary, Color secondary) {
    return GlassCard(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'VENTAS HOY', 
                style: GoogleFonts.spaceGrotesk(color: primary, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.5)
              ),
              Text(
                '\$${_totalSalesToday.toStringAsFixed(2)}', 
                style: GoogleFonts.spaceGrotesk(color: secondary, fontWeight: FontWeight.w900, fontSize: 18)
              ),
            ],
          ),
          const SizedBox(height: 32),
          SizedBox(
            height: 140,
            child: LineChart(
              LineChartData(
                gridData: const FlGridData(show: false),
                titlesData: const FlTitlesData(show: false),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: const [
                      FlSpot(0, 1.2), FlSpot(1, 2.8), FlSpot(2, 2.1), 
                      FlSpot(3, 4.5), FlSpot(4, 3.2), FlSpot(5, 5.0)
                    ],
                    isCurved: true,
                    color: primary,
                    barWidth: 4,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(
                      show: true, 
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [primary.withOpacity(0.2), Colors.transparent],
                      )
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context, Color cyan, Color lime) {
    const magentaNeon = Color(0xFFFF00FF);
    return Column(
      children: [
        Row(
          children: [
            Expanded(child: _buildActionButton('VENDER', Icons.shopping_bag_rounded, cyan, () => Navigator.pushNamed(context, '/checkout'))),
            const SizedBox(width: 12),
            Expanded(child: _buildActionButton('STOCK', Icons.inventory_2_rounded, lime, () => Navigator.pushNamed(context, '/inventory'))),
            const SizedBox(width: 12),
            Expanded(child: _buildActionButton('ESCANEAR', Icons.qr_code_scanner_rounded, magentaNeon, () {})),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _buildActionButton('CATÁLOGO', Icons.local_mall_rounded, cyan, () => _shareCatalog())),
            const SizedBox(width: 12),
            Expanded(child: _buildActionButton('PEDIDOS', Icons.notifications_active_rounded, magentaNeon, () => Navigator.pushNamed(context, '/online_orders'))),
            const SizedBox(width: 12),
            Expanded(child: _buildActionButton('CLIENTES', Icons.people_alt_rounded, lime, () => Navigator.pushNamed(context, '/clients'))),
          ],
        ),
      ],
    );
  }

  void _shareCatalog() {
    // Replace with actual URL when deployed
    const catalogUrl = 'https://pos-urena-store.vercel.app'; 
    Share.share('🛒 ¡Hola! Mira nuestro catálogo de calzado aquí: $catalogUrl');
  }

  Widget _buildActionButton(String label, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 24),
        decoration: BoxDecoration(
          color: const Color(0xFF141714),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withOpacity(0.2), width: 1.5),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32), 
            const SizedBox(height: 12), 
            Text(
              label, 
              style: GoogleFonts.orbitron(fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 1.0, color: Colors.white)
            )
          ]
        ),
      ),
    );
  }

  Widget _buildInventoryMonitoring(BuildContext context, Color lime, Color magenta) {
    return Column(
      children: [
        _buildStockProgress('ALIMENTOS', _foodStockLevel, lime),
        const SizedBox(height: 12),
        _buildStockProgress('BEBIDAS', _drinkStockLevel, magenta),
      ],
    );
  }

  Widget _buildStockProgress(String label, double val, Color color) {
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween, 
            children: [
              Text(
                label, 
                style: GoogleFonts.spaceGrotesk(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w900)
              ), 
              Text(
                '${(val * 100).toInt()}%', 
                style: GoogleFonts.spaceGrotesk(color: color, fontWeight: FontWeight.w900, fontSize: 13)
              )
            ]
          ),
          const SizedBox(height: 12),
          Stack(
            children: [
              Container(
                height: 6,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
              FractionallySizedBox(
                widthFactor: val < 0.05 ? 0.05 : val, // Min width for visibility
                child: Container(
                  height: 6,
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(3),
                    boxShadow: [BoxShadow(color: color.withOpacity(0.3), blurRadius: 6)],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRecentActivity(BuildContext context, Color cyan, Color lime) {
    if (_recentSales.isEmpty) {
      return Center(child: Text('No hay actividad reciente', style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 12)));
    }
    return Column(
      children: _recentSales.map((sale) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _buildActivityItem(
            'VENTA #${sale.orderNumber ?? '???'}', 
            '${sale.date?.hour}:${sale.date?.minute}', 
            '\$${sale.total.toStringAsFixed(2)}', 
            cyan
          ),
        );
      }).toList(),
    );
  }

  Widget _buildActivityItem(String title, String time, String value, Color color) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(Icons.bolt_rounded, color: color, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start, 
              children: [
                Text(
                  title, 
                  style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w900, fontSize: 12, color: Colors.white)
                ), 
                Text(
                  time, 
                  style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 9, fontWeight: FontWeight.bold)
                )
              ]
            )
          ),
          Text(
            value, 
            style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w900, color: color, fontSize: 14)
          ),
        ],
      ),
    );
  }
}
