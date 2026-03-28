import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:intl/intl.dart';
import '../components/glass_card.dart';
import '../models/product.dart';
import '../services/product_service.dart';

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

  final ProductService _productService = ProductService();
  List<Product> _products = [];
  bool _isLoading = true;
  String _selectedCategory = 'All';

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() => _isLoading = true);
    try {
      final data = await _productService.getAllProducts();
      setState(() {
        _products = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading products: $e'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // Filter products based on selected category
    final displayedProducts = _selectedCategory == 'All' 
        ? _products 
        : _products.where((p) => p.category == _selectedCategory).toList();

    return Scaffold(
      backgroundColor: _darkBg,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            _buildSearchBar(),
            _buildCategoryFilters(),
            _buildSectionTitle('STOCK ACTIVO', displayedProducts.length),
            Expanded(
              child: _isLoading 
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FBFF)))
                : displayedProducts.isEmpty 
                  ? Center(child: Text('No products found', style: GoogleFonts.spaceGrotesk(color: Colors.white24)))
                  : _buildProductList(displayedProducts),
            ),
          ],
        ),
      ),
      floatingActionButton: _buildFAB(),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _cyanNeon.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _cyanNeon.withOpacity(0.4)),
                ),
                child: Icon(Icons.inventory_2_rounded, color: _cyanNeon, size: 24),
              ),
              const SizedBox(width: 14),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'POS Ureña',
                    style: GoogleFonts.orbitron(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5,
                    ),
                  ),
                  Text(
                    'INVENTORY SYSTEMS',
                    style: GoogleFonts.spaceGrotesk(
                      color: _cyanNeon,
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.0,
                    ),
                  ),
                ],
              ),
            ],
          ),
          IconButton(
            onPressed: _loadProducts,
            icon: Icon(Icons.refresh_rounded, color: _cyanNeon.withOpacity(0.6), size: 24),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 10),
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF0F120F),
          borderRadius: BorderRadius.circular(30),
          border: Border.all(color: _cyanNeon.withOpacity(0.2)),
        ),
        child: TextField(
          onChanged: (value) async {
            if (value.length > 2) {
              final results = await _productService.searchProducts(value);
              setState(() => _products = results);
            } else if (value.isEmpty) {
              _loadProducts();
            }
          },
          style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 13),
          decoration: InputDecoration(
            hintText: 'Search product registry...',
            hintStyle: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 13),
            prefixIcon: Icon(Icons.search_rounded, color: _cyanNeon, size: 20),
            border: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(vertical: 14),
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryFilters() {
    final categories = ['All', 'Alimentos', 'Bebidas', 'Limpieza', 'Lácteos', 'Charcutería', 'Cosméticos'];
    return Container(
      height: 55,
      margin: const EdgeInsets.only(top: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final label = categories[index];
          bool isSelected = _selectedCategory == label;
          
          return GestureDetector(
            onTap: () => setState(() => _selectedCategory = label),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 24),
              decoration: BoxDecoration(
                color: isSelected ? _cyanNeon.withOpacity(0.8) : Colors.transparent,
                borderRadius: BorderRadius.circular(25),
                border: Border.all(
                  color: isSelected ? Colors.transparent : _cyanNeon.withOpacity(0.3),
                  width: 1.2,
                ),
              ),
              alignment: Alignment.center,
              child: Text(
                label,
                style: GoogleFonts.spaceGrotesk(
                  color: isSelected ? Colors.black : _cyanNeon,
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSectionTitle(String title, int count) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: GoogleFonts.orbitron(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w900,
              letterSpacing: 0.2,
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF1B1E1B),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '$count Items',
              style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductList(List<Product> displayList) {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 100),
      itemCount: displayList.length,
      itemBuilder: (context, index) {
        final Product p = displayList[index];
        double progress = (p.stock / p.maxStock).clamp(0.0, 1.0);
        Color prodColor = p.statusColor;

        return Padding(
          padding: const EdgeInsets.only(bottom: 16.0),
          child: GlassCard(
            onTap: () async {
              final result = await Navigator.pushNamed(context, '/product_detail', arguments: p);
              if (result == true) _loadProducts(); // Refresh if something deleted
            },
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
            child: Column(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Column(
                      children: [
                        Container(
                          width: 75, height: 75,
                          decoration: BoxDecoration(
                            color: const Color(0xFF1B1E1B),
                            borderRadius: BorderRadius.circular(15),
                            border: Border.all(color: Colors.white.withOpacity(0.05)),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(15),
                            child: (p.imageUrl != null && p.imageUrl!.isNotEmpty)
                              ? Image.network(p.imageUrl!, fit: BoxFit.cover, errorBuilder: (_,__,___) => const Icon(Icons.shopping_bag_rounded, color: Colors.white38))
                              : const Center(child: Icon(Icons.shopping_bag_rounded, color: Colors.white38, size: 24)),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'STOCK: ${p.stock}',
                          style: GoogleFonts.spaceGrotesk(
                            color: p.statusColor, 
                            fontSize: 10, 
                            fontWeight: FontWeight.w900
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            p.name, 
                            style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white)
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'BC: ${p.barcode ?? 'N/A'}', 
                            style: GoogleFonts.spaceGrotesk(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.w800)
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'COP ${p.price.toStringAsFixed(0)}', // Unified format
                            style: GoogleFonts.spaceGrotesk(color: _cyanNeon, fontWeight: FontWeight.w900, fontSize: 15)
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Stack(
                      children: [
                        Container(
                          height: 5,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: const Color(0xFF1B1E2B),
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        AnimatedContainer(
                          duration: const Duration(seconds: 1),
                          height: 5,
                          width: (MediaQuery.of(context).size.width - 88) * progress,
                          decoration: BoxDecoration(
                            color: prodColor,
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: [
                              BoxShadow(color: prodColor.withOpacity(0.4), blurRadius: 8)
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          p.stockStatus,
                          style: GoogleFonts.orbitron(color: prodColor, fontSize: 7, fontWeight: FontWeight.w900, letterSpacing: 0.5)
                        ),
                        Text(
                          '${(progress * 100).toInt()}%',
                          style: GoogleFonts.spaceGrotesk(color: prodColor, fontSize: 8, fontWeight: FontWeight.w900)
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
    return Padding(
      padding: const EdgeInsets.only(bottom: 80.0, right: 8.0),
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          color: _limeNeon,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(color: _limeNeon.withOpacity(0.4), blurRadius: 15)
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () => Navigator.pushNamed(context, '/add_product'),
            customBorder: const CircleBorder(),
            child: const Icon(Icons.add, color: Colors.black, size: 30),
          ),
        ),
      ),
    );
  }
}
