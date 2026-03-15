import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ExpenseScreen extends StatefulWidget {
  const ExpenseScreen({super.key});

  @override
  State<ExpenseScreen> createState() => _ExpenseScreenState();
}

class _ExpenseScreenState extends State<ExpenseScreen> with TickerProviderStateMixin {
  String _amountStr = '0';
  String _selectedCategory = '';
  final TextEditingController _descController = TextEditingController();

  late AnimationController _receiptController;
  late Animation<Offset> _receiptSlideAnimation;
  late Animation<double> _receiptOpacityAnimation;

  final Color _darkBg = const Color(0xFF070907);
  final Color _cardBg = const Color(0xFF141714);
  final Color _limeNeon = const Color(0xFF8CFF00);
  final Color _cyanNeon = const Color(0xFF00FBFF);

  final List<Map<String, dynamic>> _categories = [
    {'name': 'PROVEEDORES', 'icon': Icons.local_shipping_rounded},
    {'name': 'RENTA', 'icon': Icons.home_work_rounded},
    {'name': 'SERVICIOS', 'icon': Icons.bolt_rounded},
    {'name': 'SALARIOS', 'icon': Icons.payments_rounded},
    {'name': 'OTROS', 'icon': Icons.dashboard_customize_rounded},
    {'name': 'NUEVO', 'icon': Icons.add_rounded},
  ];

  @override
  void initState() {
    super.initState();
    _receiptController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200));
    _receiptSlideAnimation = Tween<Offset>(begin: const Offset(0, 1), end: const Offset(0, -1)).animate(
      CurvedAnimation(parent: _receiptController, curve: Curves.easeInOutExpo)
    );
    _receiptOpacityAnimation = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(parent: _receiptController, curve: const Interval(0.5, 1.0))
    );
  }

  @override
  void dispose() {
    _descController.dispose();
    _receiptController.dispose();
    super.dispose();
  }

  void _onNumpadPress(String val) {
    setState(() {
      if (val == 'C') {
        if (_amountStr.length > 1) {
          _amountStr = _amountStr.substring(0, _amountStr.length - 1);
        } else {
          _amountStr = '0';
        }
      } else if (val == '.') {
        if (!_amountStr.contains('.')) {
          _amountStr += val;
        }
      } else {
        if (_amountStr == '0') {
          _amountStr = val;
        } else {
          if (_amountStr.length < 10) {
            _amountStr += val;
          }
        }
      }
    });
  }

  void _confirmExpense() {
    if (_amountStr == '0' || _amountStr.isEmpty) return;
    
    _receiptController.forward().then((_) {
      _receiptController.reset();
      Navigator.pop(context);
    });
  }

  @override
  Widget build(BuildContext context) {
    double glowIntensity = _amountStr == '0' ? 0.2 : 0.8;

    return Scaffold(
      backgroundColor: _darkBg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        title: Text('REGISTRAR GASTO', style: GoogleFonts.orbitron(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 2.0)),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: _cyanNeon, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 12),
                  Text(
                    'MONTO',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2.0),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '\$${_formatAmount(_amountStr)}',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.orbitron(
                      color: _cyanNeon,
                      fontSize: 54,
                      fontWeight: FontWeight.w900,
                      shadows: [BoxShadow(color: _cyanNeon.withOpacity(glowIntensity * 0.4), blurRadius: 30 * glowIntensity)]
                    ),
                  ),
                  const SizedBox(height: 32),

                  _buildSectionTitle('CATEGORÍAS'),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    alignment: WrapAlignment.spaceBetween,
                    children: _categories.map((cat) => _buildCategoryItem(cat['name'], cat['icon'])).toList(),
                  ),
                  const SizedBox(height: 32),

                  _buildSectionTitle('DESCRIPCIÓN'),
                  const SizedBox(height: 16),
                  Container(
                    decoration: BoxDecoration(
                      color: _cardBg,
                      borderRadius: BorderRadius.circular(15),
                      border: Border.all(color: Colors.white.withOpacity(0.05)),
                    ),
                    child: TextField(
                      controller: _descController,
                      style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold),
                      decoration: InputDecoration(
                        hintText: "Concepto del pago...",
                        hintStyle: GoogleFonts.spaceGrotesk(color: Colors.white12),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.all(20),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  _buildNumpad(),
                  const SizedBox(height: 32),

                  _buildConfirmButton(),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
          
           AnimatedBuilder(
            animation: _receiptController,
            builder: (context, child) {
              if (_receiptController.isDismissed) return const SizedBox.shrink();
              return Container(
                color: Colors.black.withOpacity(0.8),
                child: Center(
                  child: SlideTransition(
                    position: _receiptSlideAnimation,
                    child: FadeTransition(
                      opacity: _receiptOpacityAnimation,
                      child: Container(
                        width: 250,
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(15),
                          boxShadow: [BoxShadow(color: _cyanNeon.withOpacity(0.5), blurRadius: 40)]
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.bolt_rounded, color: Colors.black, size: 60),
                            const SizedBox(height: 24),
                            Text('¡PAGO REGISTRADO!', textAlign: TextAlign.center, style: GoogleFonts.orbitron(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 16)),
                            const SizedBox(height: 12),
                            Text('\$${_formatAmount(_amountStr)}', style: GoogleFonts.spaceGrotesk(color: Colors.black54, fontSize: 18, fontWeight: FontWeight.w900)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.orbitron(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.5),
    );
  }

  Widget _buildCategoryItem(String name, IconData icon) {
    bool isSelected = _selectedCategory == name;
    
    return GestureDetector(
      onTap: () => setState(() => _selectedCategory = name),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: (MediaQuery.of(context).size.width - 72) / 3, // 3 dynamic columns
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: isSelected ? _cyanNeon.withOpacity(0.1) : _cardBg,
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: isSelected ? _cyanNeon : Colors.white.withOpacity(0.05), width: 1.5),
          boxShadow: [if (isSelected) BoxShadow(color: _cyanNeon.withOpacity(0.2), blurRadius: 15)],
        ),
        child: Column(
          children: [
            Icon(icon, color: isSelected ? _cyanNeon : Colors.white24, size: 24),
            const SizedBox(height: 10),
            Text(
              name,
              textAlign: TextAlign.center,
              style: GoogleFonts.spaceGrotesk(
                color: isSelected ? Colors.white : Colors.white24,
                fontSize: 9,
                fontWeight: FontWeight.w900,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNumpad() {
    final keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'C'];
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        childAspectRatio: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: keys.length,
      itemBuilder: (context, index) => _buildNumpadKey(keys[index]),
    );
  }

  Widget _buildNumpadKey(String val) {
    return Material(
      color: Colors.white.withOpacity(0.03),
      borderRadius: BorderRadius.circular(15),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => _onNumpadPress(val),
        child: Container(
          alignment: Alignment.center,
          decoration: BoxDecoration(
            border: Border.all(color: Colors.white.withOpacity(0.05)),
            borderRadius: BorderRadius.circular(15),
          ),
          child: val == 'C' 
            ? Icon(Icons.backspace_rounded, color: _cyanNeon, size: 20)
            : Text(val, style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900)),
        ),
      ),
    );
  }

  Widget _buildConfirmButton() {
    return GestureDetector(
      onTap: _confirmExpense,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 22),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [_cyanNeon, _cyanNeon.withOpacity(0.8)]),
          borderRadius: BorderRadius.circular(15),
          boxShadow: [BoxShadow(color: _cyanNeon.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 5))],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('CONFIRMAR REGISTRO', style: GoogleFonts.orbitron(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 14, letterSpacing: 1.0)),
            const SizedBox(width: 12),
            const Icon(Icons.bolt_rounded, color: Colors.black),
          ],
        ),
      ),
    );
  }

  String _formatAmount(String amount) {
    if (amount.isEmpty || amount == '0') return '0.00';
    if (amount.contains('.')) {
      final parts = amount.split('.');
      if (parts.length > 1 && parts[1].length > 2) {
        return '${parts[0]}.${parts[1].substring(0, 2)}';
      }
      return amount;
    }
    String result = '';
    int count = 0;
    for (int i = amount.length - 1; i >= 0; i--) {
      result = amount[i] + result;
      count++;
      if (count % 3 == 0 && i != 0) {
        result = ',$result';
      }
    }
    return '$result.00';
  }
}
