import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:math' as math;
import 'dashboard.dart';
import 'inventory_screen.dart';
import 'stats_screen.dart';

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> with TickerProviderStateMixin {
  int _currentIndex = 1; // Temporarily default to 1 (Stats) to show the new screen
  
  late AnimationController _pulseController;
  late AnimationController _menuController;
  bool _isMenuOpen = false;

  final List<Widget> _screens = [
    const DashboardScreen(),
    const StatsScreen(),
    const InventoryScreen(),
    const _PlaceholderScreen(title: 'Perfil y Ajustes (USER)'),
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _menuController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _menuController.dispose();
    super.dispose();
  }

  void _toggleMenu() {
    setState(() {
      _isMenuOpen = !_isMenuOpen;
      if (_isMenuOpen) {
        _menuController.forward();
      } else {
        _menuController.reverse();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    const primaryNeon = Color(0xFF00E5FF);
    const secondaryNeon = Color(0xFFFF00FF);
    const tertiaryNeon = Color(0xFFCCFF00);

    return Scaffold(
      backgroundColor: const Color(0xFF060606),
      body: Stack(
        children: [
          IndexedStack(
            index: _currentIndex,
            children: _screens,
          ),

          // 2. Overlay for FAB Menu
          if (_isMenuOpen)
            GestureDetector(
              onTap: _toggleMenu,
              child: Container(color: Colors.black87, width: double.infinity, height: double.infinity),
            ),

          // 3. Orbiting Icons from FAB
          _buildOrbitingIcons(primaryNeon, secondaryNeon, tertiaryNeon),

          // 4. Tab Bar (Bottom Navigation)
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              height: 75,
              margin: const EdgeInsets.only(left: 16, right: 16, bottom: 20),
              decoration: BoxDecoration(
                color: const Color(0xFF131313),
                borderRadius: BorderRadius.circular(25),
                border: Border.all(color: Colors.white.withOpacity(0.05)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.5),
                    spreadRadius: 2,
                    blurRadius: 15,
                    offset: const Offset(0, 10),
                  )
                ]
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildTabItem(0, Icons.grid_view_rounded, 'DASH', primaryNeon),
                  _buildTabItem(1, Icons.bar_chart_rounded, 'STATS', primaryNeon),
                  const SizedBox(width: 70), // Spacer for Central FAB
                  _buildTabItem(2, Icons.assignment_turned_in_outlined, 'STOCK', primaryNeon),
                  _buildTabItem(3, Icons.settings_outlined, 'USER', primaryNeon),
                ],
              ),
            ),
          ),

          // 5. Central Pulsing FAB
          Align(
            alignment: Alignment.bottomCenter,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 35),
              child: _buildCentralFab(primaryNeon),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabItem(int index, IconData icon, String label, Color accentColor) {
    bool isSelected = _currentIndex == index;
    Color color = isSelected ? accentColor : Colors.grey[600]!;
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _currentIndex = index;
          if (_isMenuOpen) _toggleMenu(); // Close menu if we navigate
        });
      },
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 26),
          const SizedBox(height: 4),
          Text(
            label, 
            style: GoogleFonts.spaceGrotesk(
              color: color, 
              fontSize: 10, 
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
              letterSpacing: 1.2
            )
          ),
        ],
      ),
    );
  }

  Widget _buildOrbitingIcons(Color blue, Color pink, Color green) {
    return AnimatedBuilder(
      animation: _menuController,
      builder: (context, child) {
        if (_menuController.value == 0) return const SizedBox.shrink();
        final radius = 110 * _menuController.value;
        return Stack(
          alignment: Alignment.bottomCenter,
          children: [
            _buildOrbitButton(radius, math.pi * 0.7, Icons.point_of_sale, blue, 'Nueva Venta', () { 
              _toggleMenu(); 
              Navigator.pushNamed(context, '/checkout'); 
            }),
            _buildOrbitButton(radius, math.pi * 0.5, Icons.trending_down, pink, 'Registrar Gasto', () { _toggleMenu(); }),
            _buildOrbitButton(radius, math.pi * 0.3, Icons.qr_code_scanner, green, 'Consultar Prod', () { _toggleMenu(); }),
          ],
        );
      },
    );
  }

  Widget _buildOrbitButton(double radius, double angle, IconData icon, Color color, String label, VoidCallback onTap) {
    final x = radius * math.cos(angle);
    final y = -radius * math.sin(angle);
    return Positioned(
      bottom: 105 + y, // Raised from 75 to 105 to ensure they are high above the edge
      left: MediaQuery.of(context).size.width / 2 + x - 35,
      child: Opacity(
        opacity: _menuController.value,
        child: GestureDetector(
          onTap: onTap,
          child: Column(children: [
            Container(
              width: 50, height: 50, 
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A1A), 
                shape: BoxShape.circle, 
                border: Border.all(color: color, width: 2), 
                boxShadow: [BoxShadow(color: color.withOpacity(0.4), blurRadius: 10)]
              ), 
              child: Icon(icon, color: color, size: 24)
            ),
            const SizedBox(height: 6),
            Text(label, style: GoogleFonts.spaceGrotesk(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
          ]),
        ),
      ),
    );
  }

  Widget _buildCentralFab(Color blue) {
    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        return GestureDetector(
          onTap: _toggleMenu,
          child: Container(
            width: 75, height: 75,
            decoration: BoxDecoration(
              color: const Color(0xFF0F0F0F),
              shape: BoxShape.circle,
              border: Border.all(color: blue, width: 3),
              boxShadow: [
                BoxShadow(
                  color: blue.withOpacity(0.4 * _pulseController.value),
                  blurRadius: 10 + (10 * _pulseController.value),
                  spreadRadius: 2 * _pulseController.value,
                ),
                // Inner glow simulation by removing inset or using a border inside
                // BoxShadow(color: blue.withOpacity(0.2), blurRadius: 10),
              ]..removeWhere((e) => e.color.alpha == 0),
            ),
            child: Icon(_isMenuOpen ? Icons.close : Icons.add, color: blue, size: 40),
          ),
        );
      },
    );
  }
}

class _PlaceholderScreen extends StatelessWidget {
  final String title;
  const _PlaceholderScreen({required this.title});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        'Placeholder:\n$title', 
        textAlign: TextAlign.center,
        style: GoogleFonts.spaceGrotesk(color: Colors.white54, fontSize: 20)
      ),
    );
  }
}
