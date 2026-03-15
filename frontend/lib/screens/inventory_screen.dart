import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../components/glass_card.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({super.key});

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  final List<Map<String, dynamic>> products = [
    { 'name': 'Harina PAN 1kg', 'price': 1.20, 'stock': 24, 'maxStock': 30, 'abc': 'A', 'color': const Color(0xFFCCFF00) },
    { 'name': 'Refresco Cola 2L', 'price': 2.50, 'stock': 12, 'maxStock': 40, 'abc': 'B', 'color': Colors.amber },
    { 'name': 'Jabón Azul', 'price': 0.80, 'stock': 8, 'maxStock': 100, 'abc': 'C', 'color': const Color(0xFFFF00FF) },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        title: Text('Gestión de Inventario', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      floatingActionButton: Container(
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: const Color(0xFFCCFF00).withOpacity(0.4),
              blurRadius: 20,
              spreadRadius: 2,
            )
          ],
        ),
        child: FloatingActionButton(
          onPressed: () {},
          backgroundColor: const Color(0xFFCCFF00),
          child: const Icon(Icons.add, color: Colors.black, size: 32),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Digital Business Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: theme.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: theme.primaryColor.withOpacity(0.5)),
                  ),
                  child: Icon(Icons.inventory, color: theme.primaryColor),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('POS Ureña', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold, fontSize: 18)),
                    Text('INVENTORY SYSTEMS', style: GoogleFonts.spaceGrotesk(color: theme.primaryColor, fontSize: 10, letterSpacing: 1.5)),
                  ],
                ),
              ],
            ),
          ),

          // 2. Search Bar
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(30),
                boxShadow: [
                  BoxShadow(
                    color: theme.primaryColor.withOpacity(0.1),
                    blurRadius: 10,
                    spreadRadius: 1,
                  )
                ],
              ),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search product registry...',
                  prefixIcon: Icon(Icons.search, color: theme.primaryColor),
                  suffixIcon: const Icon(Icons.mic, color: Colors.grey),
                  filled: true,
                  fillColor: Colors.white.withOpacity(0.05),
                  contentPadding: const EdgeInsets.symmetric(vertical: 0),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(30),
                    borderSide: BorderSide(color: theme.primaryColor.withOpacity(0.3)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(30),
                    borderSide: BorderSide(color: theme.primaryColor),
                  ),
                ),
              ),
            ),
          ),

          // 3. Category Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _buildChip('All', theme.primaryColor, true),
                _buildChip('Electronics', theme.primaryColor, false),
                _buildChip('Food', const Color(0xFFFF00FF), false),
                _buildChip('Fashion', Colors.grey, false),
              ],
            ),
          ),

          const Padding(
            padding: EdgeInsets.fromLTRB(16, 24, 16, 8),
            child: Text('Active Stock', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          ),

          // 4. Product List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: products.length,
              itemBuilder: (context, index) {
                final p = products[index];
                double progress = p['stock'] / p['maxStock'];
                
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: GlassCard(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 60,
                              height: 60,
                              decoration: BoxDecoration(
                                color: Colors.black,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white12),
                              ),
                              child: const Icon(Icons.inventory_2_outlined, color: Colors.white38),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(p['name'], style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.bold)),
                                  Text('ID: PRD-9021-EL', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                                  const SizedBox(height: 4),
                                  Text('\$${p['price'].toStringAsFixed(2)}', 
                                    style: GoogleFonts.spaceGrotesk(color: theme.primaryColor, fontWeight: FontWeight.bold, fontSize: 16)
                                  ),
                                ],
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text('IN STOCK', style: TextStyle(color: Colors.grey[600], fontSize: 10)),
                                Text('${p['stock']}', style: GoogleFonts.spaceGrotesk(fontSize: 24, fontWeight: FontWeight.bold)),
                              ],
                            )
                          ],
                        ),
                        const SizedBox(height: 16),
                        // Stock Progress Bar
                        Stack(
                          children: [
                            Container(
                              height: 6,
                              decoration: BoxDecoration(
                                color: Colors.white10,
                                borderRadius: BorderRadius.circular(3),
                              ),
                            ),
                            FractionallySizedBox(
                              widthFactor: progress.clamp(0.0, 1.0),
                              child: Container(
                                height: 6,
                                decoration: BoxDecoration(
                                  color: p['color'],
                                  borderRadius: BorderRadius.circular(3),
                                  boxShadow: [
                                    BoxShadow(color: p['color'].withOpacity(0.5), blurRadius: 10)
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(p['stock'] < 10 ? 'CRITICAL STOCK' : 'HEALTHY STOCK', 
                              style: GoogleFonts.spaceGrotesk(color: p['color'], fontSize: 10, fontWeight: FontWeight.bold)
                            ),
                            Text('${(progress * 100).toInt()}%', 
                              style: GoogleFonts.spaceGrotesk(color: p['color'], fontSize: 10, fontWeight: FontWeight.bold)
                            ),
                          ],
                        )
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChip(String label, Color color, bool selected) {
    return Container(
      margin: const EdgeInsets.only(right: 10),
      child: FilterChip(
        label: Text(label, style: GoogleFonts.spaceGrotesk(fontSize: 12, color: selected ? Colors.black : color)),
        selected: selected,
        onSelected: (val) {},
        backgroundColor: Colors.transparent,
        selectedColor: color,
        showCheckmark: false,
        shape: StadiumBorder(side: BorderSide(color: color.withOpacity(selected ? 1.0 : 0.5))),
      ),
    );
  }
}
