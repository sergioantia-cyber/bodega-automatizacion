import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import '../components/glass_card.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    const primaryNeon = Color(0xFF00E5FF);
    const secondaryNeon = Color(0xFFFF00FF);
    const tertiaryNeon = Color(0xFFCCFF00);

    return Scaffold(
      backgroundColor: Colors.transparent, // Background now managed by MainLayout
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
               const SizedBox(height: 20),
              _buildHeader(),
              const SizedBox(height: 24),
              _buildSalesChart(primaryNeon),
              const SizedBox(height: 24),
              _buildQuickActions(context, primaryNeon, secondaryNeon),
              const SizedBox(height: 24),
              _buildInventoryMonitoring(context, tertiaryNeon, secondaryNeon),
              const SizedBox(height: 24),
              _buildRecentActivity(context, primaryNeon, secondaryNeon),
              const SizedBox(height: 120), // Padding to account for the MainLayout Bottom Nav
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Bienvenido back,', style: TextStyle(color: Colors.grey[400], fontSize: 14)),
            Text('POS Ureña Admin', style: GoogleFonts.spaceGrotesk(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
          ],
        ),
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: Colors.white12)),
          child: const Icon(Icons.person_outline, color: Colors.white),
        ),
      ],
    );
  }

  Widget _buildSalesChart(Color neonColor) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Rendimiento Semanal', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold, fontSize: 16)),
              Text('\$4,250.00', style: GoogleFonts.spaceGrotesk(color: neonColor, fontWeight: FontWeight.bold, fontSize: 18)),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 150,
            child: LineChart(
              LineChartData(
                gridData: const FlGridData(show: false),
                titlesData: const FlTitlesData(show: false),
                borderData: FlBorderData(show: false),
                lineTouchData: LineTouchData(
                  touchTooltipData: LineTouchTooltipData(
                    getTooltipColor: (spot) => Colors.black,
                    getTooltipItems: (spots) => spots.map((s) => LineTooltipItem('\$${s.y}\n14 Mar', GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 10))).toList(),
                  ),
                ),
                lineBarsData: [
                  LineChartBarData(
                    spots: const [FlSpot(0, 1), FlSpot(1, 2), FlSpot(2, 1.5), FlSpot(3, 4), FlSpot(4, 2.5), FlSpot(5, 3)],
                    isCurved: true,
                    color: neonColor,
                    barWidth: 4,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(show: true, color: neonColor.withOpacity(0.2)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context, Color primary, Color secondary) {
    return Row(
      children: [
        Expanded(child: _buildActionButton('New Sale', Icons.shopping_bag_outlined, primary, () => Navigator.pushNamed(context, '/checkout'))),
        const SizedBox(width: 16),
        Expanded(child: _buildActionButton('Scan QR', Icons.qr_code_scanner, secondary, () {})),
      ],
    );
  }

  Widget _buildActionButton(String label, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: color.withOpacity(0.05),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withOpacity(0.4), width: 1.5),
        ),
        child: Column(children: [Icon(icon, color: color, size: 30), const SizedBox(height: 8), Text(label, style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold, fontSize: 13))]),
      ),
    );
  }

  Widget _buildInventoryMonitoring(BuildContext context, Color lime, Color magenta) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Monitoreo de Stock', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 16),
        _buildStockProgress(context, 'Alimentos', 0.8, lime),
        const SizedBox(height: 12),
        _buildStockProgress(context, 'Bebidas', 0.25, magenta),
      ],
    );
  }

  Widget _buildStockProgress(BuildContext context, String label, double val, Color color) {
    return GestureDetector(
      onTap: () => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Top 3 bajos en $label: Prod1, Prod2, Prod3'), behavior: SnackBarBehavior.floating)),
      child: GlassCard(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text(label), Text('${(val * 100).toInt()}%', style: TextStyle(color: color, fontWeight: FontWeight.bold))]),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(3),
              child: LinearProgressIndicator(value: val, backgroundColor: Colors.white12, color: color, minHeight: 6),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentActivity(BuildContext context, Color cyan, Color magenta) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Actividad Reciente', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 16),
        _buildActivityItem(context, 'Venta #042', 'Hace 2 min', '\$12.50', cyan),
        const SizedBox(height: 12),
        _buildActivityItem(context, 'Venta #041', 'Hace 15 min', '\$4.20', magenta),
      ],
    );
  }

  Widget _buildActivityItem(BuildContext context, String title, String time, String total, Color color) {
    return InkWell(
      onTap: () {},
      onLongPress: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Marcado para revisión'), behavior: SnackBarBehavior.floating)),
      child: GlassCard(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            CircleAvatar(backgroundColor: color.withOpacity(0.1), child: Icon(Icons.receipt_long, color: color, size: 20)),
            const SizedBox(width: 16),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.bold)), Text(time, style: TextStyle(color: Colors.grey, fontSize: 12))])),
            Text(total, style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
