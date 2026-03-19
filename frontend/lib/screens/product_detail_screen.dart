import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../components/glass_card.dart';
import 'edit_product_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  const ProductDetailScreen({super.key});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  // Dynamic data would normally be passed via arguments
  final Map<String, dynamic> product = {
    'name': 'Sony WH-1000XM4',
    'sku': 'POS-URE-001',
    'price': 349.00,
    'purchasePrice': 195.00,
    'stock': 142,
    'criticalLevel': 20,
    'optimalLevel': 200,
    'margin': '44.1%',
  };

  final Color darkBg = const Color(0xFF070907);
  final Color cardBg = const Color(0xFF141714);
  final Color limeNeon = const Color(0xFF8CFF00);
  final Color cyanNeon = const Color(0xFF00FBFF);
  final Color magentaNeon = const Color(0xFFFF00FF);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: darkBg,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(context),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 10),
                    _buildProductImage(cyanNeon),
                    const SizedBox(height: 32),
                    _buildProductTitle(product['name'], product['sku'], magentaNeon),
                    const SizedBox(height: 32),
                    _buildStockStatusCard(product, limeNeon),
                    const SizedBox(height: 24),
                    _buildKpiBubbles(product, cyanNeon, magentaNeon, limeNeon),
                    const SizedBox(height: 32),
                    _buildStockHistoryHeader(cyanNeon),
                    const SizedBox(height: 16),
                    _buildStockHistoryList(cyanNeon, magentaNeon, limeNeon),
                    const SizedBox(height: 100), // Spacing for buttons
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomSheet: _buildBottomActions(context, cyanNeon, limeNeon),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF00FBFF), size: 20),
          ),
          Text(
            'Detalles de Producto',
            style: GoogleFonts.orbitron(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.more_vert_rounded, color: Color(0xFF00FBFF)),
          ),
        ],
      ),
    );
  }

  Widget _buildProductImage(Color glowColor) {
    return Container(
      width: double.infinity,
      height: 300,
      decoration: BoxDecoration(
        color: const Color(0xFF1B1E1B),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
        boxShadow: [
          BoxShadow(color: glowColor.withOpacity(0.1), blurRadius: 40, spreadRadius: -10),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Icon(Icons.headphones_rounded, color: Colors.white.withOpacity(0.8), size: 150),
          Positioned(
            bottom: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.black54,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white10),
              ),
              child: const Icon(Icons.fullscreen_rounded, color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductTitle(String name, String sku, Color skuColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          name,
          style: GoogleFonts.orbitron(
            color: Colors.white,
            fontSize: 28,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.0,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'SKU: $sku',
          style: GoogleFonts.spaceGrotesk(
            color: skuColor,
            fontSize: 12,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.5,
          ),
        ),
      ],
    );
  }

  Widget _buildStockStatusCard(Map<String, dynamic> p, Color color) {
    double progress = (p['stock'] / p['optimalLevel']).clamp(0.0, 1.0);
    return GlassCard(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'ESTADO DE STOCK',
                style: GoogleFonts.orbitron(
                  color: Colors.white70,
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.5,
                ),
              ),
              Text(
                '${p['stock']} Unidades',
                style: GoogleFonts.orbitron(
                  color: color,
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Stack(
            children: [
              Container(
                height: 12,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
              FractionallySizedBox(
                widthFactor: progress,
                child: Container(
                  height: 12,
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(6),
                    boxShadow: [BoxShadow(color: color.withOpacity(0.5), blurRadius: 10)],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Crítico (${p['criticalLevel']})',
                style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.bold),
              ),
              Text(
                'Óptimo (${p['optimalLevel']})',
                style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildKpiBubbles(Map<String, dynamic> p, Color cyan, Color magenta, Color lime) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildSmallKpi('COMPRA', '\$${p['purchasePrice'].toStringAsFixed(2)}', cyan),
        _buildSmallKpi('VENTA', '\$${p['price'].toStringAsFixed(2)}', magenta),
        _buildSmallKpi('MARGEN', p['margin'], lime),
      ],
    );
  }

  Widget _buildSmallKpi(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF141714),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Column(
        children: [
          Text(
            label,
            style: GoogleFonts.spaceGrotesk(color: Colors.white38, fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 1.0),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: GoogleFonts.spaceGrotesk(color: color, fontSize: 13, fontWeight: FontWeight.w900),
          ),
        ],
      ),
    );
  }

  Widget _buildStockHistoryHeader(Color cyan) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          'Historial de Stock',
          style: GoogleFonts.orbitron(color: Colors.white70, fontSize: 16, fontWeight: FontWeight.w900),
        ),
        TextButton(
          onPressed: () {},
          child: Text(
            'Ver Todo',
            style: GoogleFonts.spaceGrotesk(color: cyan, fontSize: 12, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }

  Widget _buildStockHistoryList(Color cyan, Color magenta, Color lime) {
    return Column(
      children: [
        _buildHistoryItem('Reposición de Inv.', 'Hoy, 10:45 AM', '+50', lime),
        const SizedBox(height: 12),
        _buildHistoryItem('Punto de Venta', 'Ayer, 4:20 PM', '-2', magenta),
        const SizedBox(height: 12),
        _buildHistoryItem('Pedido Online #882', 'Oct 24, 2023', '-1', magenta),
      ],
    );
  }

  Widget _buildHistoryItem(String title, String time, String amount, Color color) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              amount.startsWith('+') ? Icons.trending_up_rounded : Icons.trending_down_rounded,
              color: color,
              size: 18,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w900),
                ),
                Text(
                  time,
                  style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          Text(
            amount,
            style: GoogleFonts.spaceGrotesk(color: color, fontSize: 16, fontWeight: FontWeight.w900),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomActions(BuildContext context, Color cyan, Color lime) {
    return Container(
      padding: const EdgeInsets.all(24),
      color: const Color(0xFF070907),
      child: Row(
        children: [
          Expanded(
            child: _buildButton('Editar Prod.', Icons.edit_rounded, cyan, false, () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const EditProductScreen()),
              );
            }),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: _buildButton('Ajustar Stock', Icons.inventory_2_rounded, lime, true, () {
              _showQuickStockAdjustment(context);
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildButton(String label, IconData icon, Color color, bool filled, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 56,
        decoration: BoxDecoration(
          color: filled ? color.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.5), width: 1.5),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 12),
            Text(
              label,
              style: GoogleFonts.orbitron(color: color, fontSize: 12, fontWeight: FontWeight.w900),
            ),
          ],
        ),
      ),
    );
  }

  void _showQuickStockAdjustment(BuildContext context) {
    String adjustmentAmount = '0';
    bool isAdding = true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            int currentStock = product['stock'];
            int amount = int.tryParse(adjustmentAmount) ?? 0;
            int projectedStock = isAdding ? (currentStock + amount) : (currentStock - amount);

            return Container(
              height: MediaQuery.of(context).size.height * 0.95,
              decoration: BoxDecoration(
                color: const Color(0xFF0D0F0D),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(40)),
                border: Border.all(color: Colors.white.withOpacity(0.05)),
              ),
              child: Column(
                children: [
                  // Fixed Handle and Header
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
                    child: Column(
                      children: [
                        Container(
                          width: 40,
                          height: 4,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            IconButton(
                              onPressed: () => Navigator.pop(context),
                              icon: const Icon(Icons.close_rounded, color: Colors.white54),
                            ),
                            Expanded(
                              child: Text(
                                'AJUSTE RÁPIDO DE STOCK',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.orbitron(
                                  color: Colors.white,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ),
                            const SizedBox(width: 48),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Scrollable Body
                  Expanded(
                    child: ListView(
                      padding: const EdgeInsets.fromLTRB(24, 8, 24, 40),
                      children: [
                        const SizedBox(height: 16),
                        // Toggle Buttons
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: Colors.black,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: _buildToggleItem(
                                  'AÑADIR',
                                  Icons.add_circle_outline_rounded,
                                  isAdding,
                                  setModalState,
                                  () => setModalState(() => isAdding = true),
                                ),
                              ),
                              Expanded(
                                child: _buildToggleItem(
                                  'RETIRAR',
                                  Icons.remove_circle_outline_rounded,
                                  !isAdding,
                                  setModalState,
                                  () => setModalState(() => isAdding = false),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                        // Info Cards
                        Row(
                          children: [
                            Expanded(
                              child: _buildAdjustmentInfoCard('ACTUAL', currentStock.toString(), 'UNIDADES', Colors.white38),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: GestureDetector(
                                onTap: () => _showEditMaxStockDialog(context, setModalState),
                                child: _buildAdjustmentInfoCard(
                                  'STOCK TOTAL',
                                  product['optimalLevel'].toString(),
                                  '✏️ TOCA PARA EDITAR',
                                  limeNeon,
                                  isEditable: true,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 32),
                        // Adjustment Value
                        Center(
                          child: Column(
                            children: [
                              Text(
                                adjustmentAmount,
                                style: GoogleFonts.orbitron(
                                  color: limeNeon,
                                  fontSize: 64,
                                  fontWeight: FontWeight.w900,
                                  shadows: [Shadow(color: limeNeon.withOpacity(0.8), blurRadius: 40)],
                                ),
                              ),
                              Text(
                                'CANTIDAD DE AJUSTE',
                                style: GoogleFonts.spaceGrotesk(
                                  color: Colors.white24,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 2,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 32),
                        // numeric Keypad
                        _buildNumericKeypad(setModalState, (val) {
                          setModalState(() {
                            if (val == 'back') {
                              if (adjustmentAmount.length > 1) {
                                adjustmentAmount = adjustmentAmount.substring(0, adjustmentAmount.length - 1);
                              } else {
                                adjustmentAmount = '0';
                              }
                            } else {
                              if (adjustmentAmount == '0') {
                                adjustmentAmount = val;
                              } else if (adjustmentAmount.length < 5) {
                                adjustmentAmount += val;
                              }
                            }
                          });
                        }),
                        const SizedBox(height: 32),
                        // Confirm Button
                        GestureDetector(
                          onTap: () {
                            setState(() {
                              product['stock'] = projectedStock;
                            });
                            Navigator.pop(context);
                          },
                          child: Container(
                            width: double.infinity,
                            height: 60,
                            decoration: BoxDecoration(
                              color: limeNeon,
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [BoxShadow(color: limeNeon.withOpacity(0.3), blurRadius: 20)],
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'CONFIRMAR AJUSTE',
                                  style: GoogleFonts.orbitron(
                                    color: Colors.black,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                const Icon(Icons.check_circle_rounded, color: Colors.black, size: 20),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _buildStatusIndicator('SYNC ACTIVE', Colors.greenAccent),
                            const SizedBox(width: 24),
                            _buildStatusIndicator('TERMINAL 04', Colors.cyanAccent),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildToggleItem(String label, IconData icon, bool selected, StateSetter setModalState, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: selected ? Colors.white.withOpacity(0.05) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: selected ? limeNeon : Colors.white24, size: 18),
            const SizedBox(width: 8),
            Text(
              label,
              style: GoogleFonts.orbitron(
                color: selected ? Colors.white : Colors.white24,
                fontSize: 11,
                fontWeight: FontWeight.w900,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdjustmentInfoCard(String label, String value, String subValue, Color highlight, {bool isEditable = false}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isEditable ? limeNeon.withOpacity(0.05) : Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isEditable ? limeNeon.withOpacity(0.3) : highlight.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: GoogleFonts.spaceGrotesk(color: highlight.withOpacity(0.5), fontSize: 10, fontWeight: FontWeight.w900),
              ),
              if (isEditable)
                Icon(Icons.edit_rounded, color: limeNeon.withOpacity(0.5), size: 14),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                value,
                style: GoogleFonts.orbitron(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
              ),
              const SizedBox(width: 6),
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Text(
                  subValue,
                  style: GoogleFonts.spaceGrotesk(color: highlight, fontSize: 10, fontWeight: FontWeight.w900),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showEditMaxStockDialog(BuildContext context, StateSetter setModalState) {
    final TextEditingController controller = TextEditingController(
      text: product['optimalLevel'].toString(),
    );

    showDialog(
      context: context,
      builder: (dialogContext) {
        return Dialog(
          backgroundColor: const Color(0xFF141714),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
            side: BorderSide(color: limeNeon.withOpacity(0.3)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.inventory_rounded, color: limeNeon, size: 36),
                const SizedBox(height: 16),
                Text(
                  'STOCK MÁXIMO DESEADO',
                  style: GoogleFonts.orbitron(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.0,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Define la cantidad máxima de stock que deseas tener de este producto.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.spaceGrotesk(
                    color: Colors.white38,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 24),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: limeNeon.withOpacity(0.3)),
                  ),
                  child: TextField(
                    controller: controller,
                    autofocus: true,
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.orbitron(
                      color: limeNeon,
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                    ),
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      hintText: '0',
                      hintStyle: GoogleFonts.orbitron(
                        color: Colors.white12,
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                      ),
                      contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => Navigator.pop(dialogContext),
                        child: Container(
                          height: 48,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: Colors.white12),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            'CANCELAR',
                            style: GoogleFonts.orbitron(
                              color: Colors.white38,
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          int? newValue = int.tryParse(controller.text);
                          if (newValue != null && newValue > 0) {
                            setState(() {
                              product['optimalLevel'] = newValue;
                            });
                            setModalState(() {});
                            Navigator.pop(dialogContext);
                          }
                        },
                        child: Container(
                          height: 48,
                          decoration: BoxDecoration(
                            color: limeNeon,
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [BoxShadow(color: limeNeon.withOpacity(0.3), blurRadius: 12)],
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            'GUARDAR',
                            style: GoogleFonts.orbitron(
                              color: Colors.black,
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
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

  Widget _buildNumericKeypad(StateSetter setModalState, Function(String) onTyped) {
    return Column(
      children: [
        Row(
          children: [
            _buildKey('1', onTyped),
            _buildKey('2', onTyped),
            _buildKey('3', onTyped),
          ],
        ),
        Row(
          children: [
            _buildKey('4', onTyped),
            _buildKey('5', onTyped),
            _buildKey('6', onTyped),
          ],
        ),
        Row(
          children: [
            _buildKey('7', onTyped),
            _buildKey('8', onTyped),
            _buildKey('9', onTyped),
          ],
        ),
        Row(
          children: [
            _buildKey('back', onTyped, isIcon: true, icon: Icons.backspace_rounded),
            _buildKey('0', onTyped),
            _buildKey('.', onTyped),
          ],
        ),
      ],
    );
  }

  Widget _buildKey(String val, Function(String) onTyped, {bool isIcon = false, IconData? icon}) {
    return Expanded(
      child: GestureDetector(
        onTap: () => onTyped(val),
        child: Container(
          height: 60,
          margin: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.03),
            borderRadius: BorderRadius.circular(15),
            border: Border.all(color: Colors.white.withOpacity(0.05)),
          ),
          alignment: Alignment.center,
          child: isIcon
              ? Icon(icon, color: Colors.white70, size: 20)
              : Text(
                  val,
                  style: GoogleFonts.orbitron(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900),
                ),
        ),
      ),
    );
  }

  Widget _buildStatusIndicator(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}

