import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import '../components/glass_card.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    const darkBg = Color(0xFF070907);
    const cardBg = Color(0xFF141714);
    const limeNeon = Color(0xFF8CFF00);
    const cyanNeon = Color(0xFF00FBFF);

    return Scaffold(
      backgroundColor: Colors.transparent, // Background managed by MainLayout
      body: SafeArea(
        child: SingleChildScrollView(
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
              _buildInventoryMonitoring(context, limeNeon, cyanNeon),
              const SizedBox(height: 32),
              _buildSectionTitle('ACTIVIDAD RECIENTE'),
              const SizedBox(height: 16),
              _buildRecentActivity(context, cyanNeon, limeNeon),
              const SizedBox(height: 120), // Bottom nav padding
            ],
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
                '+\$1,240.50', 
                style: GoogleFonts.spaceGrotesk(color: secondary, fontWeight: FontWeight.w900, fontSize: 14)
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
    return Row(
      children: [
        Expanded(child: _buildActionButton('VENDER', Icons.shopping_bag_rounded, cyan, () => Navigator.pushNamed(context, '/checkout'))),
        const SizedBox(width: 16),
        Expanded(child: _buildActionButton('STOCK', Icons.inventory_2_rounded, lime, () => Navigator.pushNamed(context, '/inventory'))),
      ],
    );
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
          boxShadow: [
            BoxShadow(color: color.withOpacity(0.05), blurRadius: 10)
          ],
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

  Widget _buildInventoryMonitoring(BuildContext context, Color lime, Color cyan) {
    return Column(
      children: [
        _buildStockProgress('ALIMENTOS', 0.82, lime),
        const SizedBox(height: 12),
        _buildStockProgress('BEBIDAS', 0.35, cyan),
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
                widthFactor: val,
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
    return Column(
      children: [
        _buildActivityItem('VENTA #084', 'HACE 2 MIN', '\$24.50', cyan),
        const SizedBox(height: 12),
        _buildActivityItem('PRODUCTO AGREGADO', 'HACE 12 MIN', 'STOCK +20', lime),
      ],
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
