import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:math' as math;
import 'dashboard.dart';
import 'inventory_screen.dart';
import 'stats_screen.dart';
import 'user_profile_screen.dart';

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> with TickerProviderStateMixin {
  int _currentIndex = 0;
  
  late AnimationController _pulseController;
  late AnimationController _menuController;
  bool _isMenuOpen = false;

  final Color _darkBg = const Color(0xFF070907);
  final Color _cardBg = const Color(0xFF141714);
  final Color _limeNeon = const Color(0xFF8CFF00);
  final Color _cyanNeon = const Color(0xFF00FBFF);

  final List<Widget> _screens = [
    const DashboardScreen(),
    const StatsScreen(),
    const InventoryScreen(),
    const UserProfileScreen(),
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
    return Scaffold(
      backgroundColor: _darkBg,
      body: Stack(
        children: [
          IndexedStack(
            index: _currentIndex,
            children: _screens,
          ),

          // 4. Tab Bar (Bottom Navigation)
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              height: 75,
              margin: const EdgeInsets.only(left: 16, right: 16, bottom: 20),
              decoration: BoxDecoration(
                color: _cardBg.withOpacity(0.95),
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
                  _buildTabItem(0, Icons.grid_view_rounded, 'INICIO'),
                  _buildTabItem(1, Icons.bar_chart_rounded, 'STATS'),
                  const SizedBox(width: 70), // Spacer for Central FAB
                  _buildTabItem(2, Icons.inventory_2_rounded, 'STOCK'),
                  _buildTabItem(3, Icons.person_outline_rounded, 'PERFIL'),
                ],
              ),
            ),
          ),

          // 2. Overlay for FAB Menu
          if (_isMenuOpen || _menuController.isAnimating)
            AnimatedBuilder(
              animation: _menuController,
              builder: (context, child) {
                if (_menuController.value == 0) return const SizedBox.shrink();
                return GestureDetector(
                  onTap: _toggleMenu,
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 15 * _menuController.value, sigmaY: 15 * _menuController.value),
                    child: Container(color: Colors.black.withOpacity(0.7 * _menuController.value), width: double.infinity, height: double.infinity),
                  ),
                );
              },
            ),

          // 3. Floating Icons Menu
          _buildFloatingMenu(),

          // 5. Central Pulsing FAB
          Align(
            alignment: Alignment.bottomCenter,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 35),
              child: _buildCentralFab(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabItem(int index, IconData icon, String label) {
    bool isSelected = _currentIndex == index;
    Color color = isSelected ? _limeNeon : Colors.white24;
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _currentIndex = index;
          if (_isMenuOpen) _toggleMenu();
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
              fontWeight: isSelected ? FontWeight.w900 : FontWeight.bold,
              letterSpacing: 1.2
            )
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingMenu() {
    return AnimatedBuilder(
      animation: _menuController,
      builder: (context, child) {
        if (_menuController.value == 0) return const SizedBox.shrink();
        
        final val = Curves.easeOutBack.transform(_menuController.value);
        final centerX = MediaQuery.of(context).size.width / 2;
        // Central position slightly above the FAB
        const centerY = 360.0;
        const spread = 135.0;
        // Angles for a symmetric 6-point radial layout
        const double top = -math.pi / 2;
        const double step = (2 * math.pi) / 7;

        double bx(double angle) => centerX + math.cos(angle) * (spread * val);
        double by(double angle) => centerY - math.sin(angle) * (spread * val);

        return Stack(
          alignment: Alignment.bottomCenter,
          children: [
            // Top: VENDER (Cyan)
            _buildGlassBubble(
              bx(top), by(top), 
              Icons.shopping_cart_rounded, _cyanNeon, 'VENDER', val, 
              () { _toggleMenu(); Navigator.pushNamed(context, '/checkout'); }
            ),
            // NUEVO PROD (Lime)
            _buildGlassBubble(
              bx(top + step), by(top + step), 
              Icons.add_rounded, _limeNeon, 'NUEVO PROD', val, 
              () { _toggleMenu(); Navigator.pushNamed(context, '/add_product'); }
            ),
            // CLIENTES (New - Blue)
            _buildGlassBubble(
              bx(top + 2 * step), by(top + 2 * step), 
              Icons.people_alt_rounded, const Color(0xFF00E5FF), 'CLIENTES', val, 
              () { _toggleMenu(); Navigator.pushNamed(context, '/clients'); }
            ),
            // GASTO (Pink)
            _buildGlassBubble(
              bx(top + 3 * step), by(top + 3 * step), 
              Icons.description_rounded, const Color(0xFFFF2D55), 'GASTO', val, 
              () { _toggleMenu(); Navigator.pushNamed(context, '/expense'); }
            ),
            // PROVEEDORES (Orange)
            _buildGlassBubble(
              bx(top + 4 * step), by(top + 4 * step), 
              Icons.business_rounded, const Color(0xFFFF9100), 'PROVEEDORES', val, 
              () { _toggleMenu(); Navigator.pushNamed(context, '/suppliers'); }
            ),
            // HISTORIAL (Purple)
            _buildGlassBubble(
              bx(top + 5 * step), by(top + 5 * step), 
              Icons.history_rounded, const Color(0xFFB388FF), 'HISTORIAL', val, 
              () { _toggleMenu(); Navigator.pushNamed(context, '/expense_history'); }
            ),
            // ESCANEAR (Yellow)
            _buildGlassBubble(
              bx(top + 6 * step), by(top + 6 * step), 
              Icons.qr_code_scanner_rounded, const Color(0xFFFFD600), 'ESCANEAR', val, 
              () { _toggleMenu(); } // Logic for scanner
            ),
          ],
        );
      },
    );
  }

  Widget _buildGlassBubble(double x, double y, IconData icon, Color color, String label, double scale, VoidCallback onTap) {
    const double size = 68.0;
    const double width = 120.0;
    return Positioned(
      left: x - (width / 2),
      bottom: y - 50,
      child: SizedBox(
        width: width,
        child: Transform.scale(
          scale: scale,
          child: Opacity(
            opacity: _menuController.value.clamp(0.0, 1.0),
            child: GestureDetector(
              onTap: onTap,
              behavior: HitTestBehavior.opaque,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: size, height: size,
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      shape: BoxShape.circle,
                      border: Border.all(color: color.withOpacity(0.8), width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: color.withOpacity(0.4), 
                          blurRadius: 15, 
                          spreadRadius: 1
                        ),
                        BoxShadow(
                          color: color.withOpacity(0.2), 
                          blurRadius: 30, 
                          spreadRadius: 5
                        ),
                      ]
                    ),
                    child: Center(
                      child: Icon(icon, color: color, size: 30),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    label, 
                    textAlign: TextAlign.center,
                    style: GoogleFonts.orbitron(
                      color: Colors.white, 
                      fontSize: 10, 
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.0,
                      shadows: [
                        const Shadow(color: Colors.black, blurRadius: 4, offset: Offset(0, 2))
                      ]
                    )
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCentralFab() {
    return AnimatedBuilder(
      animation: Listenable.merge([_pulseController, _menuController]),
      builder: (context, child) {
        // Updated to matching Vercel version: Cyan FAB
        const cyanNeon = Color(0xFF00FBFF);
        const magentaNeon = Color(0xFFFF00FF);
        final currentColor = _isMenuOpen ? magentaNeon : cyanNeon;
        final rotation = _menuController.value * math.pi / 4;

        return GestureDetector(
          onTap: _toggleMenu,
          child: Transform.rotate(
            angle: rotation,
            child: Container(
              width: 68, height: 68,
              decoration: BoxDecoration(
                color: Colors.black,
                shape: BoxShape.circle,
                border: Border.all(color: currentColor, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: currentColor.withOpacity(0.4 * _pulseController.value),
                    blurRadius: 15 + (10 * _pulseController.value),
                    spreadRadius: 2 * _pulseController.value,
                  ),
                  BoxShadow(
                    color: currentColor.withOpacity(0.2),
                    blurRadius: 30,
                  ),
                ],
              ),
              child: Center(
                child: Icon(
                  _isMenuOpen ? Icons.close_rounded : Icons.add_rounded, 
                  color: currentColor, 
                  size: 38
                ),
              ),
            ),
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
