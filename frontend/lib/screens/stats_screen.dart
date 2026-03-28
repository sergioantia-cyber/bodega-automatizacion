import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import '../components/glass_card.dart';
import '../services/sales_service.dart';

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
  
  bool _isLoading = true;
  int _selectedDayIndex = -1;
  final SalesService _salesService = SalesService();

  final List<String> _days = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
  final List<String> _months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  final List<String> _hours = List.generate(24, (i) => '${i}h');

  late Map<int, double> _currentChartData = {};
  late List<String> _currentLabels = [];
  Map<String, dynamic> _rawStats = {};
  double _chartMaxY = 5000;

  @override
  void initState() {
    super.initState();
    _loadSalesData();
  }

  Future<void> _loadSalesData() async {
    setState(() => _isLoading = true);
    final stats = await _salesService.getSalesStats();
    if (mounted) {
      setState(() {
        _rawStats = stats;
        _setupChartData();
        _isLoading = false;
      });
    }
  }

  void _setupChartData() {
    if (_timeRange == 'DIARIO') {
      final now = DateTime.now();
      _currentLabels = [];
      _currentChartData = {};
      final dailyMap = _rawStats['dailyStats'] as Map<DateTime, double>? ?? {};
      
      for (int i = 6; i >= 0; i--) {
        final date = now.subtract(Duration(days: i));
        final label = _getShortDayName(date.weekday);
        _currentLabels.add(label);
        final dayOnly = DateTime(date.year, date.month, date.day);
        _currentChartData[6 - i] = dailyMap[dayOnly] ?? 0.0;
      }
    } else if (_timeRange == 'SEMANAL') {
      final now = DateTime.now();
      _currentLabels = [];
      _currentChartData = {};
      final dailyMap = _rawStats['dailyStats'] as Map<DateTime, double>? ?? {};

      for (int i = 6; i >= 0; i--) {
        final weekAgo = now.subtract(Duration(days: i * 7));
        final weekStart = weekAgo.subtract(Duration(days: weekAgo.weekday - 1));
        final monthStr = _months[weekStart.month - 1];
        _currentLabels.add('${weekStart.day} $monthStr');

        double weekTotal = 0;
        for (int d = 0; d < 7; d++) {
          final curr = weekStart.add(Duration(days: d));
          final dayOnly = DateTime(curr.year, curr.month, curr.day);
          weekTotal += dailyMap[dayOnly] ?? 0.0;
        }
        _currentChartData[6-i] = weekTotal;
      }
    } else {
      _currentLabels = _months;
      _currentChartData = {};
      final dailyMap = _rawStats['dailyStats'] as Map<DateTime, double>? ?? {};
      for (var entry in dailyMap.entries) {
        if (entry.key.year == DateTime.now().year) {
          int mIdx = entry.key.month - 1;
          _currentChartData[mIdx] = (_currentChartData[mIdx] ?? 0) + entry.value;
        }
      }
    }

    double maxVal = 1000;
    _currentChartData.forEach((k, v) { if (v > maxVal) maxVal = v; });
    _chartMaxY = maxVal * 1.2;
  }

  String _getShortDayName(int weekday) {
    switch(weekday) {
      case 1: return 'LUN'; case 2: return 'MAR'; case 3: return 'MIÉ';
      case 4: return 'JUE'; case 5: return 'VIE'; case 6: return 'SÁB';
      default: return 'DOM';
    }
  }

  void _onTimeRangeChanged(String newRange) {
    if (_timeRange == newRange) return;
    setState(() {
      _timeRange = newRange;
      _selectedDayIndex = -1;
      _setupChartData();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
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
                    const SizedBox(height: 120),
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

  void _showUpdateDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: _cardBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: Colors.white10)),
        title: Text('ACTUALIZACIÓN REMOTA', style: GoogleFonts.orbitron(color: _cyanNeon, fontSize: 16)),
        content: Text('¿Desea buscar y descargar la última versión del APK?', style: GoogleFonts.spaceGrotesk(color: Colors.white70)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('CANCELAR')),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
            }, 
            child: Text('ACTUALIZAR', style: GoogleFonts.orbitron(color: _cyanNeon, fontWeight: FontWeight.bold))
          ),
        ],
      )
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
    double totalRevenue = _rawStats['revenue'] ?? 0.0;
    String displayLabel = 'INGRESOS TOTALES';
    
    if (_selectedDayIndex != -1) {
      totalRevenue = _currentChartData[_selectedDayIndex] ?? 0.0;
      displayLabel = 'INGRESOS ${_currentLabels[_selectedDayIndex]}';
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
          const SizedBox(height: 38),
          SizedBox(
            height: 100,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceBetween,
                maxY: _chartMaxY,
                barTouchData: BarTouchData(
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
                      getTitlesWidget: (value, meta) {
                        int index = value.toInt();
                        if (index < 0 || index >= _currentLabels.length) return const SizedBox();
                        return Padding(
                          padding: const EdgeInsets.only(top: 12.0),
                          child: Text(
                            _currentLabels[index],
                            style: GoogleFonts.spaceGrotesk(
                              color: _selectedDayIndex == index ? _cyanNeon : Colors.white24, 
                              fontSize: 7, 
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
                        width: 10,
                        borderRadius: const BorderRadius.only(topLeft: Radius.circular(3), topRight: Radius.circular(3)),
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
    double totalRev = _rawStats['revenue'] ?? 0.0;
    int totalUnits = _rawStats['units'] ?? 0;
    return Row(
      children: [
        Expanded(child: KpiCard(title: 'INGRESOS', value: '\$${totalRev.toStringAsFixed(1)}', growth: '+12%', color: _cyanNeon)),
        const SizedBox(width: 12),
        Expanded(child: KpiCard(title: 'UNIDADES', value: '$totalUnits', growth: '+8%', color: _limeNeon)),
        const SizedBox(width: 12),
        Expanded(child: KpiCard(title: 'RETORNOS', value: '2%', growth: '-1%', color: _magentaNeon)),
      ],
    );
  }

  Widget _buildTopCategories() {
    final tops = _rawStats['topCategories'] as List? ?? [];
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
                  child: PieChart(
                    PieChartData(
                      sectionsSpace: 6,
                      centerSpaceRadius: 40,
                      sections: tops.isEmpty ? [
                        PieChartSectionData(color: Colors.white10, value: 100, radius: 14, showTitle: false),
                      ] : List.generate(tops.length, (i) {
                        final colors = [_cyanNeon, _magentaNeon, _limeNeon];
                        return PieChartSectionData(
                          color: colors[i % colors.length], 
                          value: (tops[i]['value'] as num).toDouble(), 
                          radius: 14, 
                          showTitle: false
                        );
                      }),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 24),
              Expanded(
                child: Column(
                    children: List.generate(tops.length, (i) {
                      final colors = [_cyanNeon, _magentaNeon, _limeNeon];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12.0),
                        child: _buildLegendItem(tops[i]['name'], '${(tops[i]['value'] as num).toInt()}', colors[i % colors.length]),
                      );
                    }),
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
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 10),
        Text(title, style: GoogleFonts.spaceGrotesk(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.w900)),
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
          Text(value, style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
          const SizedBox(height: 10),
          Text(growth, style: GoogleFonts.spaceGrotesk(color: growth.contains('+') ? const Color(0xFF8CFF00) : const Color(0xFFFF2D55), fontSize: 12, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }
}
