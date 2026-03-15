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
  String _timeRange = 'WEEKLY';
  
  // Fake data for charts
  final Map<int, double> _weeklyData = {
    0: 1200, 1: 1800, 2: 1500, 3: 2000, 4: 1100, 5: 2500, 6: 3000
  };

  int _touchedBarIndex = -1;
  int _touchedPieIndex = -1;
  
  // Loading animation state for data refresh
  bool _isLoading = false;

  void _onTimeRangeChanged(String newRange) async {
    if (_timeRange == newRange) return;
    setState(() {
      _timeRange = newRange;
      _isLoading = true;
    });

    // Simulate network fetch / database rebuild
    await Future.delayed(const Duration(milliseconds: 600));

    if (mounted) {
      setState(() {
        _isLoading = false;
        // In a real app we would update the data here
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    const primaryNeon = Color(0xFF00E5FF);
    
    return Scaffold(
      backgroundColor: Colors.transparent, // Background managed by MainLayout
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Icon(Icons.arrow_back, color: Colors.transparent), // Layout spacing
                  Text('Sales Analytics', style: GoogleFonts.spaceGrotesk(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                  _buildExportButton(),
                ],
              ),
            ),
            
            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Column(
                  children: [
                    const SizedBox(height: 10),
                    _buildTimeSelector(primaryNeon),
                    const SizedBox(height: 20),
                    AnimatedOpacity(
                      opacity: _isLoading ? 0.3 : 1.0,
                      duration: const Duration(milliseconds: 300),
                      child: Column(
                        children: [
                          _buildRevenueChart(primaryNeon),
                          const SizedBox(height: 20),
                          _buildKpiSection(),
                          const SizedBox(height: 20),
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

  Widget _buildExportButton() {
    return GestureDetector(
      onTap: () {
        // Here we would show share/export sheet
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Generando Reporte PDF...', style: TextStyle(color: Color(0xFFFF00FF))), backgroundColor: Colors.black));
      },
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), shape: BoxShape.circle),
        child: const Icon(Icons.download, color: Color(0xFFFF00FF), size: 20),
      ),
    );
  }

  Widget _buildTimeSelector(Color activeColor) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: Colors.white12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: ['DAILY', 'WEEKLY', 'MONTHLY'].map((range) {
          final isActive = _timeRange == range;
          return Expanded(
            child: GestureDetector(
              onTap: () => _onTimeRangeChanged(range),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: isActive ? activeColor : Colors.transparent,
                  borderRadius: BorderRadius.circular(30),
                  boxShadow: [
                    if (isActive) BoxShadow(color: activeColor.withOpacity(0.5), blurRadius: 15, spreadRadius: 1)
                  ]
                ),
                alignment: Alignment.center,
                child: Text(
                  range, 
                  style: GoogleFonts.spaceGrotesk(
                    fontWeight: FontWeight.bold, 
                    fontSize: 12,
                    color: isActive ? Colors.black : Colors.grey[500],
                  )
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildRevenueChart(Color neonColor) {
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('WEEKLY REVENUE', style: GoogleFonts.spaceGrotesk(color: neonColor, fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('\$42,500.00', style: GoogleFonts.spaceGrotesk(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white, shadows: [const Shadow(color: Colors.white54, blurRadius: 10)])),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: const Color(0xFF1E3A2B), borderRadius: BorderRadius.circular(15), border: Border.all(color: const Color(0xFF00FF41))),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.trending_up, color: Color(0xFF00FF41), size: 12),
                    const SizedBox(width: 4),
                    Text('+12.5%', style: GoogleFonts.spaceGrotesk(color: const Color(0xFF00FF41), fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
              )
            ],
          ),
          const SizedBox(height: 30),
          SizedBox(
            height: 100,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceBetween,
                maxY: 4000,
                barTouchData: BarTouchData(
                  enabled: true,
                  touchCallback: (FlTouchEvent event, barTouchResponse) {
                    setState(() {
                      if (!event.isInterestedForInteractions || barTouchResponse == null || barTouchResponse.spot == null) {
                        _touchedBarIndex = -1;
                        return;
                      }
                      _touchedBarIndex = barTouchResponse.spot!.touchedBarGroupIndex;
                    });
                  },
                  touchTooltipData: BarTouchTooltipData(
                    getTooltipColor: (group) => Colors.black,
                    getTooltipItem: (group, groupIndex, rod, rodIndex) {
                      return BarTooltipItem(
                        '\$${rod.toY.toInt()}',
                        GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold),
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
                        const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
                        final isTouched = value.toInt() == _touchedBarIndex;
                        return Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Text(
                            days[value.toInt()],
                            style: GoogleFonts.spaceGrotesk(color: isTouched ? neonColor : Colors.grey[600], fontSize: 10, fontWeight: FontWeight.bold),
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
                  final isTouched = i == _touchedBarIndex;
                  return BarChartGroupData(
                    x: i,
                    barRods: [
                      BarChartRodData(
                        toY: _weeklyData[i]!,
                        color: isTouched ? neonColor : (i % 2 == 0 ? const Color(0xFF00E5FF).withOpacity(0.5) : const Color(0xFFFF00FF).withOpacity(0.5)),
                        width: 16, // Simulating horizontal thick bars (but they are vertical in fl_chart by default)
                        borderRadius: BorderRadius.circular(2),
                        backDrawRodData: BackgroundBarChartRodData(
                          show: true,
                          toY: 4000,
                          color: Colors.white.withOpacity(0.05),
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
        Expanded(child: KpiCard(title: 'PROFIT', value: '\$12.4K', growth: '+8%', color: const Color(0xFF00E5FF), isPositive: true)),
        const SizedBox(width: 12),
        Expanded(child: KpiCard(title: 'UNITS', value: '856', growth: '+15%', color: const Color(0xFFFF00FF), isPositive: true)),
        const SizedBox(width: 12),
        Expanded(child: KpiCard(title: 'RETURN', value: '42%', growth: '-2%', color: const Color(0xFFCCFF00), isPositive: false)),
      ],
    );
  }

  Widget _buildTopCategories() {
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Top Categories', style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              const Icon(Icons.more_horiz, color: Colors.grey),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              // Donut Chart
              Expanded(
                flex: 1,
                child: SizedBox(
                  height: 120,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      PieChart(
                        PieChartData(
                          pieTouchData: PieTouchData(
                            touchCallback: (FlTouchEvent event, pieTouchResponse) {
                              setState(() {
                                if (!event.isInterestedForInteractions || pieTouchResponse == null || pieTouchResponse.touchedSection == null) {
                                  _touchedPieIndex = -1;
                                  return;
                                }
                                _touchedPieIndex = pieTouchResponse.touchedSection!.touchedSectionIndex;
                              });
                            },
                          ),
                          sectionsSpace: 2,
                          centerSpaceRadius: 40,
                          sections: [
                            _buildPieSection(0, 60, const Color(0xFF00E5FF)),
                            _buildPieSection(1, 28, const Color(0xFFFF00FF)),
                            _buildPieSection(2, 12, const Color(0xFFCCFF00)),
                          ],
                        ),
                      ),
                      // Center Text
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('74%', style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                          Text('GROWTH', style: GoogleFonts.spaceGrotesk(fontSize: 8, color: Colors.grey)),
                        ],
                      )
                    ],
                  ),
                ),
              ),
              // Legend
              Expanded(
                flex: 1,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildLegendItem('Electronics', '60%', const Color(0xFF00E5FF), 0),
                    const SizedBox(height: 12),
                    _buildLegendItem('Wearables', '28%', const Color(0xFFFF00FF), 1),
                    const SizedBox(height: 12),
                    _buildLegendItem('Audio', '12%', const Color(0xFFCCFF00), 2),
                  ],
                ),
              )
            ],
          )
        ],
      ),
    );
  }

  PieChartSectionData _buildPieSection(int index, double value, Color color) {
    final isTouched = index == _touchedPieIndex;
    final fontSize = isTouched ? 16.0 : 0.0;
    final radius = isTouched ? 20.0 : 15.0;

    return PieChartSectionData(
      color: color,
      value: value,
      title: '', // Tucked inside center text
      radius: radius,
      titleStyle: TextStyle(fontSize: fontSize, fontWeight: FontWeight.bold, color: const Color(0xffffffff)),
    );
  }

  Widget _buildLegendItem(String title, String percent, Color color, int index) {
    bool isTouched = _touchedPieIndex == index;
    return GestureDetector(
      onTapDown: (_) => setState(() => _touchedPieIndex = index),
      onTapUp: (_) => setState(() => _touchedPieIndex = -1),
      onTapCancel: () => setState(() => _touchedPieIndex = -1),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
        decoration: BoxDecoration(
          color: isTouched ? color.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(5),
          border: Border.all(color: isTouched ? color.withOpacity(0.5) : Colors.transparent),
        ),
        child: Row(
          children: [
            Container(
              width: 8, height: 8,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle, boxShadow: [BoxShadow(color: color.withOpacity(0.5), blurRadius: 4)]),
            ),
            const SizedBox(width: 8),
            Text(title, style: TextStyle(color: Colors.grey[400], fontSize: 12)),
            const Spacer(),
            Text(percent, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}

// KPI Widget with Flip Animation Simulation
class KpiCard extends StatefulWidget {
  final String title;
  final String value;
  final String growth;
  final Color color;
  final bool isPositive;

  const KpiCard({super.key, required this.title, required this.value, required this.growth, required this.color, required this.isPositive});

  @override
  State<KpiCard> createState() => _KpiCardState();
}

class _KpiCardState extends State<KpiCard> {
  bool _showGraph = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => setState(() => _showGraph = !_showGraph),
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 400),
        transitionBuilder: (child, animation) => RotationYTransition(turns: animation, child: child),
        child: _showGraph 
          ? _buildGraphSide(key: const ValueKey('graph'))
          : _buildDataSide(key: const ValueKey('data')),
      ),
    );
  }

  Widget _buildDataSide({Key? key}) {
    return Container(
      key: key,
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(widget.title, style: GoogleFonts.spaceGrotesk(color: widget.color, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 8),
          Text(widget.value, style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(widget.growth, style: TextStyle(color: widget.isPositive ? const Color(0xFF00FF41) : Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildGraphSide({Key? key}) {
    return Container(
      key: key,
      height: 115, // Match height approximately
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: widget.color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: widget.color.withOpacity(0.4)),
      ),
      child: Center(
        // Mini simulated graph
        child: Icon(widget.isPositive ? Icons.trending_up : Icons.trending_down, color: widget.color, size: 40),
      ),
    );
  }
}

// Helper Widget for Flip Animation
class RotationYTransition extends AnimatedWidget {
  const RotationYTransition({
    super.key,
    required Animation<double> turns,
    required this.child,
  }) : super(listenable: turns);

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final turns = listenable as Animation<double>;
    final rotation = turns.value * math.pi;
    final isFlipped = rotation > math.pi / 2;

    return Transform(
      transform: Matrix4.rotationY(rotation),
      alignment: Alignment.center,
      child: isFlipped ? Transform(
        transform: Matrix4.rotationY(math.pi),
        alignment: Alignment.center,
        child: child,
      ) : child,
    );
  }
}
