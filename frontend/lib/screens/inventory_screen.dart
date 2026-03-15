import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../components/glass_card.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({super.key});

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  final Color _darkBg = const Color(0xFF070907);
  final Color _limeNeon = const Color(0xFF8CFF00);
  final Color _cyanNeon = const Color(0xFF00FBFF);
  final Color _cardBg = const Color(0xFF141714);

  final List<Map<String, dynamic>> products = [
    { 'name': 'Harina PAN 1kg', 'price': 1.20, 'stock': 24, 'maxStock': 30, 'abc': 'A', 'color': const Color(0xFF8CFF00) },
    { 'name': 'Refresco Cola 2L', 'price': 2.50, 'stock': 12, 'maxStock': 40, 'abc': 'B', 'color': Colors.amber },
    { 'name': 'Jabón Azul', 'price': 0.80, 'stock': 8, 'maxStock': 100, 'abc': 'C', 'color': const Color(0xFF00FBFF) },
  ];

  String _selectedCategory = 'Todos';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _darkBg,
      floatingActionButton: _buildFAB(),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            _buildSearchBar(),
            _buildCategoryFilters(),
            _buildSectionTitle('STOCK ACTIVO'),
            Expanded(
              child: _buildProductList(),
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
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'INVENTARIO',
                style: GoogleFonts.orbitron(
                  color: _limeNeon,
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 2.0,
                  shadows: [BoxShadow(color: _limeNeon.withOpacity(0.4), blurRadius: 12)]
                ),
              ),
              Text(
                'SISTEMA DE GESTIÓN POS',
                style: GoogleFonts.spaceGrotesk(
                  color: Colors.white38,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5
                ),
              ),
            ],
          ),
          IconButton(
            icon: Icon(Icons.notifications_none_rounded, color: _limeNeon),
            onPressed: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Container(
        decoration: BoxDecoration(
          color: _cardBg.withOpacity(0.6),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 4))
          ],
        ),
        child: TextField(
          style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 14),
          decoration: InputDecoration(
            hintText: 'Buscar productos...',
            hintStyle: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 14),
            prefixIcon: Icon(Icons.search_rounded, color: _cyanNeon, size: 22),
            suffixIcon: Icon(Icons.qr_code_scanner_rounded, color: _limeNeon, size: 22),
            border: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(vertical: 15),
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryFilters() {
    final categories = ['Todos', 'Alimentos', 'Bebidas', 'Limpieza', 'Electrónica'];
    return Container(
      height: 60,
      margin: const EdgeInsets.only(top: 16),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          bool isSelected = _selectedCategory == categories[index];
          return GestureDetector(
            onTap: () => setState(() => _selectedCategory = categories[index]),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.only(right: 12, top: 8, bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: isSelected ? _limeNeon.withOpacity(0.1) : Colors.transparent,
                borderRadius: BorderRadius.circular(15),
                border: Border.all(
                  color: isSelected ? _limeNeon : Colors.white12,
                  width: isSelected ? 1.5 : 1,
                ),
                boxShadow: isSelected ? [
                  BoxShadow(color: _limeNeon.withOpacity(0.2), blurRadius: 8)
                ] : [],
              ),
              alignment: Alignment.center,
              child: Text(
                categories[index],
                style: GoogleFonts.spaceGrotesk(
                  color: isSelected ? _limeNeon : Colors.white38,
                  fontSize: 12,
                  fontWeight: FontWeight.bold
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: GoogleFonts.orbitron(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.0
            ),
          ),
          Text(
            'ORDENAR ▼',
            style: GoogleFonts.spaceGrotesk(color: _cyanNeon, fontSize: 10, fontWeight: FontWeight.w900),
          ),
        ],
      ),
    );
  }

  Widget _buildProductList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      itemCount: products.length,
      itemBuilder: (context, index) {
        final p = products[index];
        double progress = p['stock'] / p['maxStock'];
        Color prodColor = p['color'];

        return Padding(
          padding: const EdgeInsets.only(bottom: 16.0),
          child: GlassCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 54,
                      height: 54,
                      decoration: BoxDecoration(
                        color: Colors.black45,
                        borderRadius: BorderRadius.circular(15),
                        border: Border.all(color: prodColor.withOpacity(0.3)),
                        boxShadow: [
                          BoxShadow(color: prodColor.withOpacity(0.1), blurRadius: 10)
                        ],
                      ),
                      child: Icon(Icons.inventory_2_rounded, color: prodColor, size: 26),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            p['name'], 
                            style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'REF: PRD-${1000 + index}', 
                            style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.bold)
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '\$${p['price'].toStringAsFixed(2)}', 
                          style: GoogleFonts.spaceGrotesk(color: _limeNeon, fontWeight: FontWeight.w900, fontSize: 18)
                        ),
                        Text(
                          'PRECIO UNIT', 
                          style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 8, fontWeight: FontWeight.bold)
                        ),
                      ],
                    )
                  ],
                ),
                const SizedBox(height: 20),
                // Custom Progress Bar
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'NIVEL DE STOCK',
                          style: GoogleFonts.spaceGrotesk(color: Colors.white54, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5)
                        ),
                        Text(
                          '${p['stock']} / ${p['maxStock']}',
                          style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w900)
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Stack(
                      children: [
                        Container(
                          height: 6,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(3),
                          ),
                        ),
                        AnimatedContainer(
                          duration: const Duration(seconds: 1),
                          height: 6,
                          width: (MediaQuery.of(context).size.width - 88) * progress,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [prodColor.withOpacity(0.5), prodColor],
                            ),
                            borderRadius: BorderRadius.circular(3),
                            boxShadow: [
                              BoxShadow(color: prodColor.withOpacity(0.4), blurRadius: 8, spreadRadius: 1)
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildFAB() {
    return Container(
      width: 64,
      height: 64,
      decoration: BoxDecoration(
        color: _limeNeon,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(color: _limeNeon.withOpacity(0.5), blurRadius: 20, spreadRadius: 2)
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            // This would navigate to the new AddProductScreen
            Navigator.pushNamed(context, '/add_product');
          },
          customBorder: const CircleBorder(),
          child: const Icon(Icons.add, color: Colors.black, size: 32),
        ),
      ),
    );
  }
}
