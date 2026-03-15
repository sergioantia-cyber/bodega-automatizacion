import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import '../components/glass_card.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> with TickerProviderStateMixin {
  final List<Map<String, dynamic>> _cartItems = [
    {'name': 'Harina PAN 1kg', 'price': 1.20, 'qty': 2},
    {'name': 'Refresco Cola 2L', 'price': 2.50, 'qty': 1},
    {'name': 'Jabón Azul', 'price': 0.80, 'qty': 3},
  ];

  late AnimationController _laserController;
  late Animation<double> _laserAnimation;
  
  bool _isFlashlightOn = false;
  String? _selectedPayment;
  bool _isProcessing = false;
  bool _showSuccess = false;
  String _manualInput = "";

  @override
  void initState() {
    super.initState();
    _laserController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    
    _laserAnimation = Tween<double>(begin: 10.0, end: 110.0).animate(
      CurvedAnimation(parent: _laserController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _laserController.dispose();
    super.dispose();
  }

  double get _subtotal => _cartItems.fold(0, (sum, item) => sum + (item['price'] * item['qty']));
  double get _tax => _subtotal * 0.07;
  double get _total => _subtotal + _tax;

  void _confirmCancel() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF111111),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFFFF00FF)),
        ),
        title: Text('¿Cancelar Venta?', style: GoogleFonts.spaceGrotesk(color: Colors.white)),
        content: Text('Se perderán todos los productos escaneados.', style: TextStyle(color: Colors.grey[400])),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('NO', style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('SÍ, CANCELAR', style: TextStyle(color: Color(0xFFFF00FF), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showTaxBreakdown() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: const Color(0xFF1A1A1A),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
          border: Border.all(color: const Color(0xFF00E5FF).withOpacity(0.5)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Desglose de Impuestos', style: GoogleFonts.spaceGrotesk(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 16),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('IVA (7%)', style: TextStyle(color: Colors.white)), Text('\$${_tax.toStringAsFixed(2)}', style: const TextStyle(color: Color(0xFF00E5FF)))]),
            const Divider(color: Colors.white12, height: 32),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              const Text('Total Impuestos', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)), 
              Text('\$${_tax.toStringAsFixed(2)}', style: const TextStyle(color: Color(0xFF00E5FF), fontWeight: FontWeight.bold))
            ]),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  void _showZelleQR() {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: GlassCard(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Escanea para Pagar via Zelle', style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16), textAlign: TextAlign.center),
              const SizedBox(height: 24),
              Container(
                width: 200, height: 200,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: const Color(0xFFFF00FF).withOpacity(0.5), blurRadius: 20, spreadRadius: 2)],
                ),
                child: const Icon(Icons.qr_code_2, size: 180, color: Colors.black),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF00FF), foregroundColor: Colors.black, shape: StadiumBorder()),
                onPressed: () => Navigator.pop(context),
                child: const Text('CERRAR', style: TextStyle(fontWeight: FontWeight.bold)),
              )
            ],
          ),
        ),
      ),
    );
  }

  void _handleNumpadPress(String key) {
    setState(() {
      if (key == '<') {
        if (_manualInput.isNotEmpty) {
          _manualInput = _manualInput.substring(0, _manualInput.length - 1);
        }
      } else {
        // Simple decimal logic for demo
        if (key == '.' && _manualInput.contains('.')) return;
        _manualInput += key;
      }
    });
  }

  Future<void> _processPayment() async {
    if (_selectedPayment == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Seleccione un método de pago', style: TextStyle(color: Color(0xFFFF00FF))), backgroundColor: Colors.black));
      return;
    }

    setState(() => _isProcessing = true);
    
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 2));
    
    setState(() {
      _isProcessing = false;
      _showSuccess = true;
    });

    // Auto navigate back after success screen
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF060606),
      appBar: AppBar(
        title: Text('Punto de Venta', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold, letterSpacing: 1.2)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Color(0xFFFF00FF)),
          onPressed: _confirmCancel, // Cancel warning
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: Color(0xFF00E5FF)),
            onPressed: () {}, // Quick search overlay
          ),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              // 1. Scanner Area & Controls
              _buildScannerSection(),

              // 2. Cart Items List
              Expanded(child: _buildCartList()),

              // 3. Totals
              _buildTotalsSection(),

              // 4. Numpad & Payment Selectors
              _buildNumpadAndPayments(),

              // 5. Final Button
              _buildProcessButton(),
            ],
          ),

          // Success State Full Screen Overlay
          if (_showSuccess)
            AnimatedContainer(
              duration: const Duration(milliseconds: 500),
              curve: Curves.easeOutCubic,
              width: double.infinity,
              height: double.infinity,
              color: const Color(0xFF00E5FF).withOpacity(0.95),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.check_circle_outline, size: 100, color: Colors.black),
                    const SizedBox(height: 20),
                    Text('¡VENTA EXITOSA!', style: GoogleFonts.spaceGrotesk(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.black)),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildScannerSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Column(
        children: [
          Container(
            height: 140,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.02),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF00E5FF).withOpacity(0.4), width: 1.5),
              boxShadow: [BoxShadow(color: const Color(0xFF00E5FF).withOpacity(0.1), blurRadius: 20)],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Stack(
                children: [
                  const Center(child: Icon(Icons.qr_code_scanner, size: 60, color: Colors.white24)),
                  AnimatedBuilder(
                    animation: _laserAnimation,
                    builder: (context, child) {
                      return Positioned(
                        top: _laserAnimation.value,
                        left: 20, right: 20,
                        child: Container(
                          height: 2,
                          decoration: BoxDecoration(
                            color: const Color(0xFF00E5FF),
                            boxShadow: [BoxShadow(color: const Color(0xFF00E5FF), blurRadius: 10, spreadRadius: 3)],
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          // Scanner Quick Controls
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildControlBtn(
                Icons.flashlight_on, 
                _isFlashlightOn ? const Color(0xFFCCFF00) : Colors.grey, 
                () => setState(() => _isFlashlightOn = !_isFlashlightOn)
              ),
              const SizedBox(width: 24),
              _buildControlBtn(Icons.add, const Color(0xFF00E5FF), () {} /* Add manual */),
              const SizedBox(width: 24),
              _buildControlBtn(Icons.flip_camera_ios, Colors.white, () {} /* Rotate camera */),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildControlBtn(IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          shape: BoxShape.circle,
          border: Border.all(color: color.withOpacity(0.5)),
          boxShadow: [if (color != Colors.grey && color != Colors.white) BoxShadow(color: color.withOpacity(0.3), blurRadius: 10)],
        ),
        child: Icon(icon, color: color, size: 24),
      ),
    );
  }

  Widget _buildCartList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: _cartItems.length,
      itemBuilder: (context, index) {
        final item = _cartItems[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12.0),
          child: Slidable(
            key: ValueKey(item['name']),
            endActionPane: ActionPane(
              motion: const ScrollMotion(),
              children: [
                const SizedBox(width: 8),
                CustomSlidableAction(
                  onPressed: (_) {},
                  backgroundColor: const Color(0xFF00E5FF).withOpacity(0.1),
                  foregroundColor: const Color(0xFF00E5FF),
                  borderRadius: BorderRadius.circular(15),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.edit, size: 24),
                      Text('Ajustar', style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.bold))
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                CustomSlidableAction(
                  onPressed: (_) => setState(() => _cartItems.removeAt(index)),
                  backgroundColor: const Color(0xFFFF00FF).withOpacity(0.1),
                  foregroundColor: const Color(0xFFFF00FF),
                  borderRadius: BorderRadius.circular(15),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.delete, size: 24),
                      Text('Elim', style: GoogleFonts.spaceGrotesk(fontSize: 10, fontWeight: FontWeight.bold))
                    ],
                  ),
                ),
              ],
            ),
            child: GlassCard(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                    child: const Icon(Icons.shopping_bag_outlined, color: Colors.white70, size: 20),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item['name'], style: GoogleFonts.spaceGrotesk(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                        Text('Cant: ${item['qty']}', style: TextStyle(color: Colors.grey[400], fontSize: 12)),
                      ],
                    ),
                  ),
                  Text('\$${(item['price'] * item['qty']).toStringAsFixed(2)}', 
                    style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildTotalsSection() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: Colors.white10), bottom: BorderSide(color: Colors.white10)),
      ),
      child: Column(
        children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text('Subtotal', style: TextStyle(color: Colors.grey[400])), Text('\$${_subtotal.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold))]),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: _showTaxBreakdown,
            child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('Tax (7%)', style: TextStyle(color: const Color(0xFF00E5FF).withOpacity(0.8), decoration: TextDecoration.underline, decorationColor: const Color(0xFF00E5FF))), 
              Text('\$${_tax.toStringAsFixed(2)}', style: TextStyle(color: const Color(0xFF00E5FF).withOpacity(0.8)))
            ]),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('TOTAL', style: GoogleFonts.spaceGrotesk(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
              TweenAnimationBuilder<double>(
                tween: Tween<double>(begin: _total, end: _total),
                duration: const Duration(milliseconds: 300),
                builder: (context, value, child) {
                  return Text('\$${value.toStringAsFixed(2)}', 
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 32, 
                      fontWeight: FontWeight.bold, 
                      color: const Color(0xFF00E5FF),
                      shadows: [const Shadow(color: Color(0xFF00E5FF), blurRadius: 15)]
                    )
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNumpadAndPayments() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Numpad (Left)
          Expanded(
            flex: 3,
            child: GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 3,
              childAspectRatio: 1.5,
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              children: [
                '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '<'
              ].map((key) => _buildNumpadKey(key)).toList(),
            ),
          ),
          const SizedBox(width: 16),
          // Payment Methods (Right)
          Expanded(
            flex: 2,
            child: Column(
              children: [
                _buildPaymentOption('CASH', Icons.payments, const Color(0xFFCCFF00)),
                const SizedBox(height: 8),
                _buildPaymentOption('CARD', Icons.credit_card, const Color(0xFF00E5FF)),
                const SizedBox(height: 8),
                _buildPaymentOption('ZELLE', Icons.account_balance_wallet, const Color(0xFFFF00FF)),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildNumpadKey(String val) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _handleNumpadPress(val),
        splashColor: const Color(0xFF00E5FF).withOpacity(0.3),
        borderRadius: BorderRadius.circular(10),
        child: Ink(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: Colors.white12),
          ),
          child: Center(
            child: val == '<' 
              ? const Icon(Icons.backspace_outlined, color: Colors.white70, size: 20)
              : Text(val, style: GoogleFonts.spaceGrotesk(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentOption(String id, IconData icon, Color color) {
    bool isSelected = _selectedPayment == id;
    return GestureDetector(
      onTap: () {
        setState(() => _selectedPayment = id);
        if (id == 'ZELLE') _showZelleQR();
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 60,
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.15) : Colors.white.withOpacity(0.02),
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: isSelected ? color : Colors.white12, width: isSelected ? 2 : 1),
          boxShadow: [if (isSelected) BoxShadow(color: color.withOpacity(0.3), blurRadius: 15, spreadRadius: 1)],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: isSelected ? color : Colors.white54, size: 24),
            const SizedBox(width: 8),
            Text(id, style: GoogleFonts.spaceGrotesk(color: isSelected ? color : Colors.white54, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildProcessButton() {
    return Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
        child: GestureDetector(
          onTap: _isProcessing ? null : _processPayment,
          child: Container(
            width: double.infinity,
            height: 60,
            decoration: BoxDecoration(
              color: _selectedPayment != null ? const Color(0xFF00E5FF) : Colors.grey[800],
              borderRadius: BorderRadius.circular(15),
              boxShadow: _selectedPayment != null ? [
                const BoxShadow(color: Color(0xFF00E5FF), blurRadius: 20, spreadRadius: 2)
              ] : [],
            ),
            child: Center(
              child: _isProcessing 
                ? const SizedBox(width: 30, height: 30, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 3))
                : Text('PROCESS PAYMENT', style: GoogleFonts.spaceGrotesk(color: _selectedPayment != null ? Colors.black : Colors.grey[500], fontWeight: FontWeight.bold, fontSize: 18, letterSpacing: 1.5)),
            ),
          ),
        ),
    );
  }
}
