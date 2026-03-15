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

  final Color _darkBg = const Color(0xFF070907);
  final Color _limeNeon = const Color(0xFF8CFF00);
  final Color _cyanNeon = const Color(0xFF00FBFF);
  final Color _cardBg = const Color(0xFF141714);

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
        backgroundColor: _cardBg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: Colors.white.withOpacity(0.05)),
        ),
        title: Text('¿CANCELAR VENTA?', style: GoogleFonts.orbitron(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 1.0)),
        content: Text('SE PERDERÁN TODOS LOS PRODUCTOS ESCANEADOS.', style: GoogleFonts.spaceGrotesk(color: Colors.white38, fontSize: 12, fontWeight: FontWeight.bold)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('VOLVER', style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontWeight: FontWeight.w900)),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: Text('CANCELAR', style: GoogleFonts.spaceGrotesk(color: const Color(0xFFFF2D55), fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }

  void _showZelleQR() {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: GlassCard(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('ESCANEAR ZELLE', style: GoogleFonts.orbitron(color: _cyanNeon, fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 1.5)),
              const SizedBox(height: 24),
              Container(
                width: 220, height: 220,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(15),
                  boxShadow: [BoxShadow(color: _cyanNeon.withOpacity(0.3), blurRadius: 30)],
                ),
                child: const Icon(Icons.qr_code_2_rounded, size: 200, color: Colors.black),
              ),
              const SizedBox(height: 24),
              Text('MONTO TOTAL: \$${_total.toStringAsFixed(2)}', style: GoogleFonts.spaceGrotesk(color: Colors.white54, fontWeight: FontWeight.w900, fontSize: 12)),
              const SizedBox(height: 32),
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 12),
                  decoration: BoxDecoration(
                    color: _cyanNeon.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(color: _cyanNeon),
                  ),
                  child: Text('CERRAR', style: GoogleFonts.spaceGrotesk(color: _cyanNeon, fontWeight: FontWeight.w900)),
                ),
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
        if (key == '.' && _manualInput.contains('.')) return;
        _manualInput += key;
      }
    });
  }

  Future<void> _processPayment() async {
    if (_selectedPayment == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('SELECCIONA MÉTODO DE PAGO', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w900)),
          backgroundColor: const Color(0xFFFF2D55),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() => _isProcessing = true);
    await Future.delayed(const Duration(seconds: 2));
    
    if (mounted) {
      setState(() {
        _isProcessing = false;
        _showSuccess = true;
      });
    }

    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _darkBg,
      appBar: AppBar(
        title: Text('CHECKOUT', style: GoogleFonts.orbitron(fontWeight: FontWeight.w900, letterSpacing: 2.0, fontSize: 18, color: Colors.white)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.close_rounded, color: _limeNeon),
          onPressed: _confirmCancel,
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.search_rounded, color: _cyanNeon),
            onPressed: () {},
          ),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              _buildScannerSection(),
              Expanded(child: _buildCartList()),
              _buildTotalsSection(),
              _buildNumpadAndPayments(),
              _buildProcessButton(),
            ],
          ),

          if (_showSuccess)
            Positioned.fill(
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 500),
                color: _limeNeon.withOpacity(0.95),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: const BoxDecoration(color: Colors.black, shape: BoxShape.circle),
                        child: Icon(Icons.check_rounded, size: 80, color: _limeNeon),
                      ),
                      const SizedBox(height: 32),
                      Text('TRANSACCIÓN', style: GoogleFonts.orbitron(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.black, letterSpacing: 2.0)),
                      Text('EXITOSA', style: GoogleFonts.orbitron(fontSize: 48, fontWeight: FontWeight.w900, color: Colors.black, letterSpacing: 4.0)),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildScannerSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
      child: Column(
        children: [
          Container(
            height: 140,
            decoration: BoxDecoration(
              color: _cardBg,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(0.05)),
              boxShadow: [BoxShadow(color: _cyanNeon.withOpacity(0.05), blurRadius: 20)],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Stack(
                children: [
                   Center(child: Icon(Icons.qr_code_scanner_rounded, size: 60, color: Colors.white.withOpacity(0.05))),
                  AnimatedBuilder(
                    animation: _laserAnimation,
                    builder: (context, child) {
                      return Positioned(
                        top: _laserAnimation.value,
                        left: 20, right: 20,
                        child: Container(
                          height: 2,
                          decoration: BoxDecoration(
                            color: _cyanNeon,
                            boxShadow: [BoxShadow(color: _cyanNeon, blurRadius: 10, spreadRadius: 3)],
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildControlBtn(Icons.flashlight_on_rounded, _isFlashlightOn ? _limeNeon : Colors.white24, () => setState(() => _isFlashlightOn = !_isFlashlightOn)),
              const SizedBox(width: 32),
              _buildControlBtn(Icons.add_rounded, _cyanNeon, () {}),
              const SizedBox(width: 32),
              _buildControlBtn(Icons.flip_camera_ios_rounded, Colors.white24, () {}),
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
          color: color.withOpacity(0.05),
          shape: BoxShape.circle,
          border: Border.all(color: color.withOpacity(0.3)),
          boxShadow: [if (color != Colors.white24) BoxShadow(color: color.withOpacity(0.1), blurRadius: 10)],
        ),
        child: Icon(icon, color: color, size: 22),
      ),
    );
  }

  Widget _buildCartList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
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
                  onPressed: (_) => setState(() => _cartItems.removeAt(index)),
                  backgroundColor: const Color(0xFFFF2D55).withOpacity(0.1),
                  foregroundColor: const Color(0xFFFF2D55),
                  borderRadius: BorderRadius.circular(15),
                  child: const Icon(Icons.delete_outline_rounded, size: 24),
                ),
              ],
            ),
            child: GlassCard(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(color: Colors.black45, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white12)),
                    child: const Icon(Icons.shopping_bag_rounded, color: Colors.white24, size: 20),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item['name'], style: GoogleFonts.spaceGrotesk(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white)),
                        Text('CANT: ${item['qty']}', style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.w900)),
                      ],
                    ),
                  ),
                  Text('\$${(item['price'] * item['qty']).toStringAsFixed(2)}', 
                    style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.w900, color: _limeNeon)
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
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        color: _cardBg.withOpacity(0.5),
        border: const Border(top: BorderSide(color: Colors.white10)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween, 
            children: [
              Text('IMPUESTOS (7%)', style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.0)), 
               Text('\$${_tax.toStringAsFixed(2)}', style: GoogleFonts.spaceGrotesk(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w900))
            ]
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('TOTAL', style: GoogleFonts.orbitron(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 1.0)),
              Text('\$${_total.toStringAsFixed(2)}', 
                style: GoogleFonts.orbitron(
                  fontSize: 28, 
                  fontWeight: FontWeight.w900, 
                  color: _cyanNeon,
                  shadows: [Shadow(color: _cyanNeon.withOpacity(0.5), blurRadius: 15)]
                )
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNumpadAndPayments() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
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
          Expanded(
            flex: 2,
            child: Column(
              children: [
                _buildPaymentOption('CASH', Icons.payments_rounded, _limeNeon),
                const SizedBox(height: 8),
                _buildPaymentOption('CARD', Icons.credit_card_rounded, _cyanNeon),
                const SizedBox(height: 8),
                _buildPaymentOption('ZELLE', Icons.wallet_rounded, const Color(0xFFB388FF)),
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
        borderRadius: BorderRadius.circular(15),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.03),
            borderRadius: BorderRadius.circular(15),
            border: Border.all(color: Colors.white.withOpacity(0.05)),
          ),
          child: Center(
            child: val == '<' 
              ? Icon(Icons.backspace_rounded, color: _limeNeon, size: 18)
              : Text(val, style: GoogleFonts.spaceGrotesk(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
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
        height: 52,
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: isSelected ? color : Colors.white.withOpacity(0.05), width: 1.5),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: isSelected ? color : Colors.white24, size: 18),
            const SizedBox(width: 8),
            Text(id, style: GoogleFonts.spaceGrotesk(color: isSelected ? color : Colors.white24, fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 1.0)),
          ],
        ),
      ),
    );
  }

  Widget _buildProcessButton() {
    return Padding(
        padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
        child: GestureDetector(
          onTap: _isProcessing ? null : _processPayment,
          child: Container(
            width: double.infinity,
            height: 60,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: _selectedPayment != null ? [_cyanNeon, _limeNeon] : [Colors.white10, Colors.white10],
              ),
              borderRadius: BorderRadius.circular(15),
              boxShadow: _selectedPayment != null ? [
                BoxShadow(color: _cyanNeon.withOpacity(0.3), blurRadius: 20)
              ] : [],
            ),
            child: Center(
              child: _isProcessing 
                ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 3))
                : Text('COBRAR \$${_total.toStringAsFixed(2)}', style: GoogleFonts.orbitron(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 1.5)),
            ),
          ),
        ),
    );
  }
}
