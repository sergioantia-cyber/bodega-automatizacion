import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/product.dart';
import '../services/product_service.dart';
import '../components/glass_card.dart';

class InactiveProductsScreen extends StatefulWidget {
  const InactiveProductsScreen({super.key});

  @override
  State<InactiveProductsScreen> createState() => _InactiveProductsScreenState();
}

class _InactiveProductsScreenState extends State<InactiveProductsScreen> {
  final ProductService _productService = ProductService();
  bool _isLoading = true;
  List<Product> _inactiveProducts = [];

  final Color _cyanNeon = const Color(0xFF00FBFF);
  final Color _magentaNeon = const Color(0xFFFF00FF);
  final Color _redNeon = const Color(0xFFFF2D55);

  @override
  void initState() {
    super.initState();
    _loadInactiveProducts();
  }

  Future<void> _loadInactiveProducts() async {
    setState(() => _isLoading = true);
    try {
      final products = await _productService.getInactiveProducts();
      setState(() {
        _inactiveProducts = products;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _restoreProduct(String id) async {
    try {
      await _productService.restoreProduct(id);
      _loadInactiveProducts();
    } catch (e) {}
  }

  void _confirmPermanentDelete(Product p) {
    double slideValue = 0.0;
    bool showPinInput = false;
    final pinController = TextEditingController();

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          backgroundColor: const Color(0xFF070907),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30),
            side: BorderSide(color: _redNeon.withOpacity(0.3)),
          ),
          content: Container(
            width: 320,
            padding: const EdgeInsets.symmetric(vertical: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.delete_forever_rounded, color: _redNeon, size: 48),
                const SizedBox(height: 16),
                Text(
                  showPinInput ? 'INGRESE PIN' : 'BORRADO PERMANENTE',
                  style: GoogleFonts.orbitron(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 8),
                Text(
                  showPinInput ? 'Confirmación requerida' : 'Esta acción eliminará EL REGISTRO del producto de forma IRREVERSIBLE.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.spaceGrotesk(color: Colors.white38, fontSize: 11),
                ),
                const SizedBox(height: 32),
                
                if (!showPinInput) ...[
                  // SLIDER
                  Container(
                    height: 60,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: Stack(
                      children: [
                        Center(
                          child: Text(
                            'DESLIZA PARA ELIMINAR',
                            style: GoogleFonts.orbitron(color: Colors.white12, fontSize: 9, fontWeight: FontWeight.w900),
                          ),
                        ),
                        Positioned(
                          left: slideValue * (320 - 70),
                          child: GestureDetector(
                            onHorizontalDragUpdate: (details) {
                              setState(() {
                                slideValue = (slideValue + details.delta.dx / 200).clamp(0.0, 1.0);
                                if (slideValue == 1.0) showPinInput = true;
                              });
                            },
                            child: Container(
                              width: 50, height: 50, margin: const EdgeInsets.all(5),
                              decoration: BoxDecoration(color: _redNeon, shape: BoxShape.circle),
                              child: const Icon(Icons.chevron_right_rounded, color: Colors.black),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ] else ...[
                  TextField(
                    controller: pinController,
                    autofocus: true,
                    keyboardType: TextInputType.number,
                    obscureText: true,
                    maxLength: 4,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.orbitron(color: _redNeon, fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: 10),
                    decoration: const InputDecoration(counterText: '', hintText: '****'),
                    onChanged: (val) async {
                      if (val == '0424') {
                        await _productService.permanentlyDeleteProduct(p.id!);
                        Navigator.pop(dialogContext);
                        _loadInactiveProducts();
                      } else if (val.length == 4) {
                        pinController.clear();
                      }
                    },
                  ),
                ],
                const SizedBox(height: 24),
                TextButton(
                  onPressed: () => Navigator.pop(dialogContext),
                  child: Text('CANCELAR', style: GoogleFonts.spaceGrotesk(color: Colors.white24)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070907),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF00FBFF)),
        ),
        title: Text('PAPELERA DE PRODUCTOS', style: GoogleFonts.orbitron(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _inactiveProducts.isEmpty 
          ? Center(child: Text('No hay productos inactivos', style: GoogleFonts.spaceGrotesk(color: Colors.white24)))
          : ListView.builder(
              padding: const EdgeInsets.all(24),
              itemCount: _inactiveProducts.length,
              itemBuilder: (context, index) {
                final p = _inactiveProducts[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: GlassCard(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(p.name, style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold)),
                              Text('SKU: ${p.barcode ?? 'N/A'}', style: GoogleFonts.spaceGrotesk(color: Colors.white30, fontSize: 10)),
                            ],
                          ),
                        ),
                        IconButton(
                          onPressed: () => _restoreProduct(p.id!),
                          icon: const Icon(Icons.restore_from_trash_rounded, color: Color(0xFF8CFF00)),
                        ),
                        IconButton(
                          onPressed: () => _confirmPermanentDelete(p),
                          icon: Icon(Icons.delete_forever_rounded, color: _redNeon),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
