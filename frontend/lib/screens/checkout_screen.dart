import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import '../components/glass_card.dart';
import '../models/product.dart';
import '../models/sale.dart';
import '../models/client.dart';
import '../services/product_service.dart';
import '../services/sales_service.dart';
import '../services/client_service.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> with TickerProviderStateMixin {
  final ProductService _productService = ProductService();
  final SalesService _salesService = SalesService();
  final ClientService _clientService = ClientService();

  final List<Map<String, dynamic>> _cartItems = [];
  Client? _selectedClient;
  
  late AnimationController _laserController;
  late Animation<double> _laserAnimation;
  
  bool _isFlashlightOn = false;
  bool _isCameraActive = false;
  String? _selectedPayment;
  bool _isProcessing = false;
  bool _showSuccess = false;
  String _manualInput = "";

  final Color _darkBg = const Color(0xFF070907);
  final Color _limeNeon = const Color(0xFF8CFF00);
  final Color _cyanNeon = const Color(0xFF00FBFF);
  final Color _magentaNeon = const Color(0xFFFF00FF);
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
    if (_cartItems.isEmpty) {
      Navigator.pop(context);
      return;
    }
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

  void _showPaymentQR(String provider, Color color) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: GlassCard(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('PAGAR CON $provider', style: GoogleFonts.orbitron(color: color, fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 1.5)),
              const SizedBox(height: 24),
              Container(
                width: 200, height: 200,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(15),
                  boxShadow: [BoxShadow(color: color.withOpacity(0.3), blurRadius: 30)],
                ),
                child: Image.network(
                  'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=UreñaPOS_$provider',
                  loadingBuilder: (context, child, loadingProgress) {
                    if (loadingProgress == null) return child;
                    return const Center(child: CircularProgressIndicator(color: Colors.black));
                  },
                ),
              ),
              const SizedBox(height: 24),
              Text('MONTO: \$${_total.toStringAsFixed(2)}', style: GoogleFonts.spaceGrotesk(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 4),
              Text('Ureña POS Enterprise', style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 10)),
              const SizedBox(height: 32),
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 12),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(color: color),
                  ),
                  child: Text('CONFIRMAR PAGO', style: GoogleFonts.spaceGrotesk(color: color, fontWeight: FontWeight.w900)),
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
    if (_cartItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('EL CARRITO ESTÁ VACÍO')));
      return;
    }
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
    
    try {
      // 1. Create Sale Items
      final saleItems = _cartItems.map((item) {
        return SaleItem(
          productId: item['productId'],
          productName: item['name'],
          quantity: item['qty'] as int,
          unitPrice: item['price'] as double,
          subtotal: (item['price'] as double) * (item['qty'] as int),
        );
      }).toList();

      // 2. Create Sale
      final sale = Sale(
        clientId: _selectedClient?.id,
        subtotal: _subtotal,
        tax: _tax,
        total: _total,
        paymentMethod: _selectedPayment!,
        items: saleItems,
      );

      await _salesService.createSale(sale, saleItems);

      // 3. Update stock for each product
      for (final item in _cartItems) {
        await _productService.decrementProductStock(item['productId'], (item['qty'] as int).toDouble());
      }

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
    } catch (e) {
      if (mounted) {
        setState(() => _isProcessing = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error al procesar: $e')));
      }
    }
  }

  Future<void> _searchAndAddProduct() async {
    final TextEditingController searchController = TextEditingController();
    List<Product> results = [];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: _darkBg,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(30))),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.8,
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Text('BUSCAR PRODUCTO', style: GoogleFonts.orbitron(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
                  const SizedBox(height: 20),
                  TextField(
                    controller: searchController,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Código o nombre...',
                      hintStyle: const TextStyle(color: Colors.white24),
                      prefixIcon: Icon(Icons.search, color: _cyanNeon),
                      filled: true,
                      fillColor: Colors.white.withOpacity(0.05),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide.none),
                    ),
                    onChanged: (val) async {
                      if (val.length > 2) {
                        final found = await _productService.searchProducts(val);
                        setModalState(() => results = found);
                      }
                    },
                  ),
                  const SizedBox(height: 20),
                  Expanded(
                    child: ListView.builder(
                      itemCount: results.length,
                      itemBuilder: (context, index) {
                        final p = results[index];
                        return ListTile(
                          title: Text(p.name, style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold)),
                          subtitle: Text('\$${p.price.toStringAsFixed(2)} - Stock: ${p.stock}', style: GoogleFonts.spaceGrotesk(color: Colors.white38)),
                          trailing: IconButton(
                            icon: Icon(Icons.add_circle_rounded, color: _limeNeon),
                            onPressed: () {
                              _addProductToCart(p);
                              Navigator.pop(context);
                            },
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            );
          }
        );
      },
    );
  }

  void _addProductToCart(Product p) {
    setState(() {
      int index = _cartItems.indexWhere((item) => item['productId'] == p.id);
      if (index != -1) {
        _cartItems[index]['qty']++;
      } else {
        _cartItems.add({
          'productId': p.id,
          'name': p.name,
          'price': p.price,
          'qty': 1,
        });
      }
    });
  }

  Future<void> _selectClient() async {
    final items = await _clientService.getClients();
    if (!mounted) return;
    
    showModalBottomSheet(
      context: context,
      backgroundColor: _darkBg,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(30))),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              Text('SELECCIONAR CLIENTE', style: GoogleFonts.orbitron(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
              const SizedBox(height: 20),
              Expanded(
                child: ListView.builder(
                  itemCount: items.length,
                  itemBuilder: (context, index) {
                    final c = items[index];
                    return ListTile(
                      title: Text(c.name, style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold)),
                      subtitle: Text(c.document ?? '', style: GoogleFonts.spaceGrotesk(color: Colors.white38)),
                      onTap: () {
                        setState(() => _selectedClient = c);
                        Navigator.pop(context);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
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
            icon: Icon(_selectedClient == null ? Icons.person_add_rounded : Icons.person_rounded, 
                color: _selectedClient == null ? _cyanNeon : _limeNeon),
            onPressed: _selectClient,
          ),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              _buildScannerSection(),
              if (_selectedClient != null)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                  child: Row(
                    children: [
                      Icon(Icons.person_rounded, color: _limeNeon, size: 16),
                      const SizedBox(width: 8),
                      Text('CLIENTE: ${_selectedClient!.name.toUpperCase()}', 
                        style: GoogleFonts.spaceGrotesk(color: _limeNeon, fontSize: 10, fontWeight: FontWeight.w900)),
                      const Spacer(),
                      GestureDetector(
                        onTap: () => setState(() => _selectedClient = null),
                        child: const Icon(Icons.close, color: Colors.white24, size: 16),
                      )
                    ],
                  ),
                ),
              Expanded(child: SingleChildScrollView(
                child: Column(
                  children: [
                    _buildCartList(),
                    _buildTotalsSection(),
                    _buildNumpadAndPayments(),
                    _buildProcessButton(),
                  ],
                ),
              )),
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
              border: Border.all(color: _isCameraActive ? _cyanNeon.withOpacity(0.5) : Colors.white.withOpacity(0.05)),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Stack(
                children: [
                  if (!_isCameraActive)
                    Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.camera_alt_rounded, size: 40, color: Colors.white10),
                          const SizedBox(height: 8),
                          Text(
                            'CÁMARA INACTIVA',
                            style: GoogleFonts.orbitron(color: Colors.white10, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.5),
                          ),
                        ],
                      ),
                    )
                  else
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: RadialGradient(
                            colors: [Colors.white.withOpacity(0.05), Colors.transparent],
                            radius: 1.0,
                          ),
                        ),
                        child: Center(
                          child: Opacity(
                            opacity: 0.1,
                            child: Icon(Icons.barcode_reader, size: 80, color: Colors.white),
                          ),
                        ),
                      ),
                    ),
                  
                  if (_isCameraActive)
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
              _buildControlBtn(
                _isCameraActive ? Icons.videocam_off_rounded : Icons.videocam_rounded, 
                _isCameraActive ? _limeNeon : _cyanNeon, 
                () => setState(() => _isCameraActive = !_isCameraActive)
              ),
              const SizedBox(width: 24),
              _buildControlBtn(
                Icons.flashlight_on_rounded, 
                _isFlashlightOn ? _limeNeon : Colors.white24, 
                _isCameraActive ? () => setState(() => _isFlashlightOn = !_isFlashlightOn) : null
              ),
              const SizedBox(width: 24),
              _buildControlBtn(Icons.add_rounded, _cyanNeon, _searchAndAddProduct),
              const SizedBox(width: 24),
              _buildControlBtn(Icons.flip_camera_ios_rounded, Colors.white24, _isCameraActive ? () {} : null),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildControlBtn(IconData icon, Color color, VoidCallback? onTap) {
    bool isDisabled = onTap == null;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isDisabled ? Colors.transparent : color.withOpacity(0.05),
          shape: BoxShape.circle,
          border: Border.all(color: isDisabled ? Colors.white.withOpacity(0.02) : color.withOpacity(0.3)),
        ),
        child: Icon(icon, color: isDisabled ? Colors.white.withOpacity(0.05) : color, size: 22),
      ),
    );
  }

  Widget _buildCartList() {
    if (_cartItems.isEmpty) {
      return Container(
        height: 100,
        alignment: Alignment.center,
        child: Text('CARRITO VACÍO', style: GoogleFonts.spaceGrotesk(color: Colors.white10, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
      );
    }
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      itemCount: _cartItems.length,
      itemBuilder: (context, index) {
        final item = _cartItems[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12.0),
          child: Slidable(
            key: ValueKey(item['productId']),
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
            child: SizedBox(
              height: 220,
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    _buildPaymentOption('CASH', Icons.payments_rounded, _limeNeon),
                    const SizedBox(height: 8),
                    _buildPaymentOption('CARD', Icons.credit_card_rounded, _cyanNeon),
                    const SizedBox(height: 8),
                    _buildPaymentOption('NEQUI', Icons.phonelink_ring_rounded, _magentaNeon),
                    const SizedBox(height: 8),
                    _buildPaymentOption('BANCOLOMBIA', Icons.account_balance_rounded, const Color(0xFFFFD700)),
                    const SizedBox(height: 8),
                    _buildPaymentOption('ZELLE', Icons.wallet_rounded, const Color(0xFFB388FF)),
                  ],
                ),
              ),
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
        if (id == 'ZELLE') _showPaymentQR('ZELLE', const Color(0xFFB388FF));
        if (id == 'NEQUI') _showPaymentQR('NEQUI', _magentaNeon);
        if (id == 'BANCOLOMBIA') _showPaymentQR('BANCOLOMBIA', const Color(0xFFFFD700));
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
