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
  bool _isLoading = false;
  int _selectedDayIndex = -1;

  // Dynamic Data Structures
  final List<String> _days = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
  final List<String> _months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  final List<String> _hours = List.generate(24, (i) => '${i}h');

  // Improved Mock Data
  late Map<int, double> _currentChartData;
  late List<String> _currentLabels;

  final Map<int, double> _weeklyData = {0: 1200, 1: 1800, 2: 1500, 3: 2000, 4: 1100, 5: 2500, 6: 3000};
  final Map<int, double> _dailyData = {8: 200, 10: 450, 12: 800, 14: 600, 16: 1200, 18: 900, 20: 300}; // Segments by hour
  final Map<int, double> _monthlyData = {0: 15000, 1: 18000, 2: 21000, 3: 16000, 4: 25000, 5: 32000, 6: 45000, 7: 38000, 8: 41000, 9: 48000, 10: 52000, 11: 55000};

  @override
  void initState() {
    super.initState();
    _currentChartData = _weeklyData;
    _currentLabels = _days;
  }

  void _onTimeRangeChanged(String newRange) async {
    if (_timeRange == newRange) return;
    setState(() {
      _timeRange = newRange;
      _isLoading = true;
      _selectedDayIndex = -1; // Reset selection
      
      // Update dynamic data
      if (newRange == 'DIARIO') {
        _currentChartData = _dailyData;
        _currentLabels = _hours;
      } else if (newRange == 'SEMANAL') {
        _currentChartData = _weeklyData;
        _currentLabels = _days;
      } else {
        _currentChartData = _monthlyData;
        _currentLabels = _months;
      }
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
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildCircleIcon(Icons.arrow_back_rounded),
          Text(
            'Análisis de Ventas',
            style: GoogleFonts.orbitron(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w900,
              letterSpacing: 1.0,
            ),
          ),
          _buildNotificationIcon(),
        ],
      ),
    );
  }

  Widget _buildCircleIcon(IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _cardBg.withOpacity(0.5),
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Icon(icon, color: Colors.white70, size: 20),
    );
  }

  Widget _buildNotificationIcon() {
    return Stack(
      children: [
        _buildCircleIcon(Icons.notifications_rounded),
        Positioned(
          right: 12,
          top: 12,
          child: Container(
            width: 8, height: 8,
            decoration: BoxDecoration(
              color: _magentaNeon,
              shape: BoxShape.circle,
              border: Border.all(color: _darkBg, width: 1.5),
            ),
          ),
        ),
      ],
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
        color: _cardBg.withOpacity(0.4),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      padding: const EdgeInsets.all(6),
      child: Row(
        children: ['DIARIO', 'SEMANAL', 'MENSUAL'].map((range) {
          final isActive = _timeRange == range;
          return Expanded(
            child: GestureDetector(
              onTap: () => _onTimeRangeChanged(range),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: isActive ? _cyanNeon : Colors.transparent,
                  borderRadius: BorderRadius.circular(25),
                  boxShadow: isActive ? [
                    BoxShadow(color: _cyanNeon.withOpacity(0.4), blurRadius: 15, spreadRadius: 1)
                  ] : [],
                ),
                alignment: Alignment.center,
                child: Text(
                  range, 
                  style: GoogleFonts.spaceGrotesk(
                    fontWeight: FontWeight.w900, 
                    fontSize: 12,
                    color: isActive ? Colors.black : Colors.white38,
                    letterSpacing: 1.2
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
    double totalRevenue = 42500.0;
    String displayLabel = 'INGRESOS SEMANALES';
    
    if (_selectedDayIndex != -1) {
      if (_timeRange == 'SEMANAL') {
        totalRevenue = _weeklyData[_selectedDayIndex] ?? 0.0;
        displayLabel = 'INGRESOS ${_days[_selectedDayIndex]}';
      } else if (_timeRange == 'MENSUAL') {
        totalRevenue = _monthlyData[_selectedDayIndex] ?? 0.0;
        displayLabel = 'INGRESOS ${_months[_selectedDayIndex]}';
      } else {
        totalRevenue = _dailyData[_selectedDayIndex] ?? 0.0;
        displayLabel = 'VENDIDO A LAS ${_hours[_selectedDayIndex]}';
      }
    } else {
      if (_timeRange == 'MENSUAL') {
        totalRevenue = 485000.0;
        displayLabel = 'INGRESOS ANUALES TOTALES';
      } else if (_timeRange == 'DIARIO') {
        totalRevenue = 4450.0;
        displayLabel = 'INGRESOS DEL DÍA';
      }
    }

    return GlassCard(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                displayLabel, 
                style: GoogleFonts.spaceGrotesk(color: _cyanNeon, fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.w900)
              ),
              if (_selectedDayIndex != -1)
                GestureDetector(
                  onTap: () => setState(() => _selectedDayIndex = -1),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: _cyanNeon.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: _cyanNeon.withOpacity(0.3)),
                    ),
                    child: Text(
                      'RESTAURAR',
                      style: GoogleFonts.orbitron(color: _cyanNeon, fontSize: 8, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '\$${totalRevenue.toStringAsFixed(2)}', 
                style: GoogleFonts.orbitron(
                  fontSize: 28, 
                  fontWeight: FontWeight.w900, 
                  color: Colors.white,
                  shadows: [
                    Shadow(color: Colors.white.withOpacity(0.5), blurRadius: 20),
                    Shadow(color: _cyanNeon.withOpacity(0.3), blurRadius: 40),
                  ]
                )
              ),
              if (_selectedDayIndex == -1)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1B3B2B).withOpacity(0.4), 
                    borderRadius: BorderRadius.circular(12), 
                    border: Border.all(color: _limeNeon.withOpacity(0.2))
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
          const SizedBox(height: 38),
          SizedBox(
            height: 100,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceBetween,
                maxY: 4000,
                barTouchData: BarTouchData(
                  touchTooltipData: BarTouchTooltipData(
                    getTooltipItem: (group, groupIndex, rod, rodIndex) => null,
                  ),
                  touchCallback: (event, response) {
                    if (event is FlTapUpEvent && response != null && response.spot != null) {
                      setState(() {
                        _selectedDayIndex = response.spot!.touchedBarGroupIndex;
                      });
                    }
                  },
                ),
                titlesData: FlTitlesData(
                  show: true,
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 30,
                      interval: _timeRange == 'DIARIO' ? 4 : 1, // Only show some hours to avoid clutter
                      getTitlesWidget: (value, meta) {
                        int index = value.toInt();
                        if (index < 0 || index >= _currentLabels.length) return const SizedBox();
                        
                        return Padding(
                          padding: const EdgeInsets.only(top: 12.0),
                          child: Text(
                            _currentLabels[index],
                            style: GoogleFonts.spaceGrotesk(
                              color: _selectedDayIndex == index ? _cyanNeon : Colors.white24, 
                              fontSize: 9, 
                              fontWeight: FontWeight.w900
                            ),
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
                barGroups: List.generate(_currentLabels.length, (i) {
                  final isSelected = _selectedDayIndex == i;
                  final double value = _currentChartData[i] ?? 0.0;
                  final color = isSelected ? _cyanNeon : ((i % 3 == 0) ? _magentaNeon : _cyanNeon.withOpacity(0.5));
                  
                  return BarChartGroupData(
                    x: i,
                    barRods: [
                      BarChartRodData(
                        toY: value,
                        color: color,
                        width: _timeRange == 'MENSUAL' ? 8 : (_timeRange == 'DIARIO' ? 4 : 14),
                        borderRadius: const BorderRadius.only(topLeft: Radius.circular(3), topRight: Radius.circular(3)),
                        backDrawRodData: BackgroundBarChartRodData(
                          show: true,
                          toY: _timeRange == 'MENSUAL' ? 60000 : 4000,
                          color: Colors.white.withOpacity(0.04),
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
    String benefit = '\$12.4K';
    String units = '856';
    String returns = '42%';
    String bGrowth = '+8%';
    String uGrowth = '+15%';
    String rGrowth = '-2%';

    if (_selectedDayIndex != -1) {
      final double rev = _currentChartData[_selectedDayIndex] ?? 0.0;
      benefit = '\$${(rev * 0.35).toStringAsFixed(0)}'; // Estimated 35% benefit
      units = (rev / 15).toStringAsFixed(0); // Estimated units
      returns = '${(rev % 5).toStringAsFixed(1)}%';
      bGrowth = 'REF';
      uGrowth = 'REF';
      rGrowth = 'REF';
    }

    return Row(
      children: [
        Expanded(child: KpiCard(title: 'BENEFICIOS', value: benefit, growth: bGrowth, color: _cyanNeon)),
        const SizedBox(width: 12),
        Expanded(child: KpiCard(title: 'UNIDADES', value: units, growth: uGrowth, color: _limeNeon)),
        const SizedBox(width: 12),
        Expanded(child: KpiCard(title: 'RETORNOS', value: returns, growth: rGrowth, color: _magentaNeon)),
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
                          sectionsSpace: 6,
                          centerSpaceRadius: 40,
                          sections: [
                            PieChartSectionData(color: _cyanNeon, value: 60, title: '', radius: 14, showTitle: false),
                            PieChartSectionData(color: _magentaNeon, value: 28, title: '', radius: 14, showTitle: false),
                            PieChartSectionData(color: _limeNeon, value: 12, title: '', radius: 14, showTitle: false),
                          ],
                        ),
                      ),
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('74%', style: GoogleFonts.orbitron(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
                          Text('CRECIMIENTO', style: GoogleFonts.spaceGrotesk(fontSize: 8, color: Colors.white38, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 24),
              Expanded(
                child: Column(
                    children: [
                       _buildLegendItem('Electrónica', '60%', _cyanNeon),
                       const SizedBox(height: 18),
                       _buildLegendItem('Accesorios', '28%', _magentaNeon),
                       const SizedBox(height: 18),
                       _buildLegendItem('Audio', '12%', _limeNeon),
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
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF141714).withOpacity(0.4),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withOpacity(0.04)),
      ),
      child: Column(
        children: [
          Text(title, style: GoogleFonts.spaceGrotesk(color: color, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.2)),
          const SizedBox(height: 16),
          Text(value, style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
          const SizedBox(height: 10),
          Text(
            growth, 
            style: GoogleFonts.spaceGrotesk(
              color: growth.contains('+') ? const Color(0xFF8CFF00) : const Color(0xFFFF2D55), 
              fontSize: 12, 
              fontWeight: FontWeight.w900
            )
          ),
        ],
      ),
    );
  }
}
