import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../components/glass_card.dart';

class SuppliersScreen extends StatefulWidget {
  const SuppliersScreen({super.key});

  @override
  State<SuppliersScreen> createState() => _SuppliersScreenState();
}

class _SuppliersScreenState extends State<SuppliersScreen> {
  final Color _darkBg = const Color(0xFF070907);
  final Color _limeNeon = const Color(0xFF8CFF00);
  final Color _cyanNeon = const Color(0xFF00FBFF);
  final Color _cardBg = const Color(0xFF141714);

  final List<Map<String, String>> _suppliers = [
    {'name': 'Alpina S.A.', 'contact': '310 123 4567', 'category': 'Lácteos'},
    {'name': 'Distribuidora Ureña', 'contact': '320 987 6543', 'category': 'General'},
    {'name': 'Cervecería Polar', 'contact': '300 111 2233', 'category': 'Bebidas'},
  ];

  void _addSupplier() {
    // Prototipo de diálogo para añadir proveedor
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: GlassCard(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('NUEVO PROVEEDOR', style: GoogleFonts.orbitron(color: _limeNeon, fontWeight: FontWeight.w900, fontSize: 16)),
              const SizedBox(height: 20),
              _buildNeonInput('Nombre del Proveedor'),
              const SizedBox(height: 12),
              _buildNeonInput('Celular / Contacto'),
              const SizedBox(height: 12),
              _buildNeonInput('Categoría / Tipo'),
              const SizedBox(height: 32),
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  height: 50,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: [_limeNeon, _cyanNeon]),
                    borderRadius: BorderRadius.circular(15),
                    boxShadow: [BoxShadow(color: _limeNeon.withOpacity(0.3), blurRadius: 15)],
                  ),
                  child: Center(
                    child: Text('GUARDAR', style: GoogleFonts.orbitron(color: Colors.black, fontWeight: FontWeight.w900)),
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNeonInput(String label) {
    return TextField(
      style: GoogleFonts.spaceGrotesk(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 12),
        filled: true,
        fillColor: Colors.white.withOpacity(0.03),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.05))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: _limeNeon)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _darkBg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('GESTIÓN DE PROVEEDORES', style: GoogleFonts.orbitron(fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 1.0)),
        centerTitle: true,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_rounded, color: _limeNeon),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          _buildSummary(),
          Expanded(child: _buildSuppliersList()),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addSupplier,
        backgroundColor: _limeNeon,
        child: const Icon(Icons.person_add_rounded, color: Colors.black),
      ),
    );
  }

  Widget _buildSummary() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: GlassCard(
        padding: const EdgeInsets.all(20),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildStatItem('ACTIVOS', '12', _cyanNeon),
            _buildStatItem('POR PAGAR', '\$2.4M', _limeNeon),
            _buildStatItem('ÚLTIMO PAGO', 'Hoy', Colors.white54),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(label, style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.w900)),
        Text(value, style: GoogleFonts.orbitron(color: color, fontSize: 18, fontWeight: FontWeight.w900)),
      ],
    );
  }

  Widget _buildSuppliersList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      itemCount: _suppliers.length,
      itemBuilder: (context, index) {
        final supplier = _suppliers[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12.0),
          child: GlassCard(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 50, height: 50,
                  decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(15), border: Border.all(color: Colors.white.withOpacity(0.05))),
                  child: Icon(Icons.business_rounded, color: _cyanNeon),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(supplier['name']!, style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
                      Text(supplier['category']!, style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 11)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(supplier['contact']!, style: GoogleFonts.orbitron(color: _limeNeon, fontSize: 10, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    const Icon(Icons.more_vert_rounded, color: Colors.white24),
                  ],
                )
              ],
            ),
          ),
        );
      },
    );
  }
}
