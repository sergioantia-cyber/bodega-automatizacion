import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:math' as math;
import '../components/glass_card.dart';

class StatsScreen extends StatefulWidget {
  const StatsScreen({super.key});

  @override
  State<StatsScreen> createState() => _StatsScreenState();
}

class _StatsScreenState extends State<StatsScreen> with TickerProviderStateMixin {
  String _timeRange = 'SEMANAL';
  
  final Color _darkBg = const Color(0xFF070907);
  final Color _cardBg = const Color(0xFF141714);
  final Color _limeNeon = const Color(0xFF8CFF00);
  final Color _cyanNeon = const Color(0xFF00FBFF);
  final Color _magentaNeon = const Color(0xFFFF00FF);

  // Fake data for charts
  final Map<int, double> _weeklyData = {
    0: 1200, 1: 1800, 2: 1500, 3: 2000, 4: 1100, 5: 2500, 6: 3000
  };

  int _touchedBarIndex = -1;
  int _touchedPieIndex = -1;
  bool _isLoading = false;

  void _onTimeRangeChanged(String newRange) async {
    if (_timeRange == newRange) return;
    setState(() {
      _timeRange = newRange;
      _isLoading = true;
    });
    await Future.delayed(const Duration(milliseconds: 600));
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent, // Background managed by MainLayout
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Column(
                  children: [
                    const SizedBox(height: 10),
                    _buildTimeSelector(),
                    const SizedBox(height: 32),
                    AnimatedOpacity(
                      opacity: _isLoading ? 0.3 : 1.0,
                      duration: const Duration(milliseconds: 300),
                      child: Column(
                        children: [
                          _buildRevenueChart(),
                          const SizedBox(height: 24),
                          _buildKpiSection(),
                          const SizedBox(height: 24),
                          _buildTopCategories(),
                        ],
                      ),
                    ),
                    const SizedBox(height: 120), // Bottom nav padding
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'ANÁLISIS',
            style: GoogleFonts.orbitron(
              color: _limeNeon,
              fontSize: 24,
              fontWeight: FontWeight.w900,
              letterSpacing: 2.0,
              shadows: [BoxShadow(color: _limeNeon.withOpacity(0.4), blurRadius: 12)]
            ),
          ),
          _buildExportButton(),
        ],
      ),
    );
  }

  Widget _buildExportButton() {
    return GestureDetector(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Generando Reporte...', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold)), 
            backgroundColor: _cyanNeon.withOpacity(0.9),
            behavior: SnackBarBehavior.floating,
          )
        );
      },
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: _cardBg,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white12),
        ),
        child: Icon(Icons.download_rounded, color: _cyanNeon, size: 22),
      ),
    );
  }

  Widget _buildTimeSelector() {
    return Container(
      decoration: BoxDecoration(
        color: _cardBg.withOpacity(0.6),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: ['DIARIO', 'SEMANAL', 'MENSUAL'].map((range) {
          final isActive = _timeRange == range;
          return Expanded(
            child: GestureDetector(
              onTap: () => _onTimeRangeChanged(range),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: isActive ? _limeNeon.withOpacity(0.1) : Colors.transparent,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isActive ? _limeNeon : Colors.transparent),
                ),
                alignment: Alignment.center,
                child: Text(
                  range, 
                  style: GoogleFonts.spaceGrotesk(
                    fontWeight: FontWeight.w900, 
                    fontSize: 11,
                    color: isActive ? _limeNeon : Colors.white24,
                    letterSpacing: 1.0
                  )
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildRevenueChart() {
    return GlassCard(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'FLUJO DE CAJA SEMANAL', 
            style: GoogleFonts.spaceGrotesk(color: _cyanNeon, fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.w900)
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '\$42,500.00', 
                style: GoogleFonts.orbitron(fontSize: 26, fontWeight: FontWeight.w900, color: Colors.white)
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05), 
                  borderRadius: BorderRadius.circular(10), 
                  border: Border.all(color: _limeNeon.withOpacity(0.3))
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.trending_up_rounded, color: _limeNeon, size: 14),
                    const SizedBox(width: 4),
                    Text('+12.5%', style: GoogleFonts.spaceGrotesk(color: _limeNeon, fontSize: 11, fontWeight: FontWeight.w900)),
                  ],
                ),
              )
            ],
          ),
          const SizedBox(height: 32),
          SizedBox(
            height: 120,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceBetween,
                maxY: 4000,
                barTouchData: BarTouchData(
                  enabled: true,
                  touchTooltipData: BarTouchTooltipData(
                    getTooltipColor: (group) => _cardBg,
                    getTooltipItem: (group, groupIndex, rod, rodIndex) {
                      return BarTooltipItem(
                        '\$${rod.toY.toInt()}',
                        GoogleFonts.spaceGrotesk(color: _cyanNeon, fontWeight: FontWeight.w900),
                      );
                    },
                  ),
                ),
                titlesData: FlTitlesData(
                  show: true,
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
                        return Padding(
                          padding: const EdgeInsets.only(top: 10.0),
                          child: Text(
                            days[value.toInt()],
                            style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        );
                      },
                    ),
                  ),
                  leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                gridData: const FlGridData(show: false),
                borderData: FlBorderData(show: false),
                barGroups: List.generate(7, (i) {
                  return BarChartGroupData(
                    x: i,
                    barRods: [
                      BarChartRodData(
                        toY: _weeklyData[i]!,
                        color: (i == 6 || i == 5) ? _limeNeon : _cyanNeon.withOpacity(0.5),
                        width: 12,
                        borderRadius: BorderRadius.circular(4),
                        backDrawRodData: BackgroundBarChartRodData(
                          show: true,
                          toY: 4000,
                          color: Colors.white.withOpacity(0.03),
                        ),
                      ),
                    ],
                  );
                }),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildKpiSection() {
    return Row(
      children: [
        Expanded(child: KpiCard(title: 'BENEFICIOS', value: '\$12.4K', growth: '+8%', color: _cyanNeon)),
        const SizedBox(width: 12),
        Expanded(child: KpiCard(title: 'UNIDADES', value: '856', growth: '+15%', color: _limeNeon)),
        const SizedBox(width: 12),
        Expanded(child: KpiCard(title: 'RETORNOS', value: '42%', growth: '-2%', color: _magentaNeon)),
      ],
    );
  }

  Widget _buildTopCategories() {
    return GlassCard(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'CATEGORÍAS TOP', 
            style: GoogleFonts.spaceGrotesk(color: _limeNeon, fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.w900)
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 120,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      PieChart(
                        PieChartData(
                          sectionsSpace: 4,
                          centerSpaceRadius: 35,
                          sections: [
                            PieChartSectionData(color: _cyanNeon, value: 60, title: '', radius: 10, showTitle: false),
                            PieChartSectionData(color: _limeNeon, value: 25, title: '', radius: 10, showTitle: false),
                            PieChartSectionData(color: _magentaNeon, value: 15, title: '', radius: 10, showTitle: false),
                          ],
                        ),
                      ),
                      Text('74%', style: GoogleFonts.orbitron(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 24),
              Expanded(
                child: Column(
                    children: [
                      _buildLegendItem('ALIMENTOS', '60%', _cyanNeon),
                      const SizedBox(height: 12),
                      _buildLegendItem('BEBIDAS', '25%', _limeNeon),
                      const SizedBox(height: 12),
                      _buildLegendItem('OTROS', '15%', _magentaNeon),
                    ],
                ),
              )
            ],
          )
        ],
      ),
    );
  }

  Widget _buildLegendItem(String title, String percent, Color color) {
    return Row(
      children: [
        Container(
          width: 8, height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 10),
        Text(title, style: GoogleFonts.spaceGrotesk(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
        const Spacer(),
        Text(percent, style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 11)),
      ],
    );
  }
}

class KpiCard extends StatelessWidget {
  final String title;
  final String value;
  final String growth;
  final Color color;

  const KpiCard({super.key, required this.title, required this.value, required this.growth, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF141714).withOpacity(0.6),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: GoogleFonts.spaceGrotesk(color: color.withOpacity(0.7), fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.8)),
          const SizedBox(height: 8),
          Text(value, style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
          const SizedBox(height: 6),
          Text(growth, style: GoogleFonts.spaceGrotesk(color: growth.contains('+') ? const Color(0xFF8CFF00) : const Color(0xFFFF2D55), fontSize: 10, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }
}
