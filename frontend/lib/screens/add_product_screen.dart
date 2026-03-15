import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:math' as math;

class AddProductScreen extends StatefulWidget {
  const AddProductScreen({super.key});

  @override
  State<AddProductScreen> createState() => _AddProductScreenState();
}

class _AddProductScreenState extends State<AddProductScreen> {
  final Color _darkBg = const Color(0xFF070907); // Darker background
  final Color _limeNeon = const Color(0xFF8CFF00); // More vibrant lime
  final Color _cyanNeon = const Color(0xFF00FBFF); // Vibrante cyan
  final Color _cardBg = const Color(0xFF141714); // Container bg

  bool _isTrackingStock = true;
  
  // Focus nodes to glow the fields
  final FocusNode _nameFocus = FocusNode();
  final FocusNode _catFocus = FocusNode();
  final FocusNode _skuFocus = FocusNode();
  final FocusNode _costFocus = FocusNode();
  final FocusNode _saleFocus = FocusNode();

  @override
  void initState() {
    super.initState();
    _nameFocus.addListener(() => setState(() {}));
    _catFocus.addListener(() => setState(() {}));
    _skuFocus.addListener(() => setState(() {}));
    _costFocus.addListener(() => setState(() {}));
    _saleFocus.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _nameFocus.dispose();
    _catFocus.dispose();
    _skuFocus.dispose();
    _costFocus.dispose();
    _saleFocus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _darkBg,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 10.0),
                child: Column(
                  children: [
                    const SizedBox(height: 20),
                    _buildImageUpload(),
                    const SizedBox(height: 48),
                    _buildInputField('NOMBRE DEL PRODUCTO', 'ej. Cyber Energy Drink', _nameFocus),
                    const SizedBox(height: 20),
                    _buildDropdownField('CATEGORÍA', 'Seleccionar Categoría', _catFocus),
                    const SizedBox(height: 20),
                    _buildInputField('SKU / CÓDIGO BARRAS', 'Escanear o teclear', _skuFocus, trailingIcon: Icons.qr_code_scanner),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(child: _buildInputField('COSTO', '\$ 0.00', _costFocus)),
                        const SizedBox(width: 16),
                        Expanded(child: _buildInputField('PRECIO VENTA', '\$ 0.00', _saleFocus)),
                      ],
                    ),
                    const SizedBox(height: 24),
                    _buildStockToggle(),
                    const SizedBox(height: 40),
                    _buildSaveButton(),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 16.0),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white70, size: 22),
              onPressed: () => Navigator.pop(context),
            ),
          ),
          Text(
            'AÑADIR PRODUCTO',
            style: GoogleFonts.orbitron( // More tech/cyber font for titles
              color: _limeNeon,
              fontSize: 18,
              fontWeight: FontWeight.w800,
              letterSpacing: 2.0,
              shadows: [
                BoxShadow(color: _limeNeon.withOpacity(0.4), blurRadius: 12),
              ]
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImageUpload() {
    return Center(
      child: Stack(
        alignment: Alignment.center,
        clipBehavior: Clip.none,
        children: [
          // Circular shadow for glow
          Container(
            width: 150,
            height: 150,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(color: _cyanNeon.withOpacity(0.15), blurRadius: 40, spreadRadius: 5)
              ],
            ),
          ),
          // Dashed Circle Painter
          SizedBox(
            width: 140,
            height: 140,
            child: CustomPaint(
              painter: DashedCirclePainter(color: _cyanNeon),
            ),
          ),
          // Content
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.camera_alt_rounded, color: _cyanNeon, size: 42),
              const SizedBox(height: 10),
              Text(
                'SUBIR IMAGEN',
                style: GoogleFonts.spaceGrotesk(
                  color: _cyanNeon,
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.5
                ),
              ),
            ],
          ),
          // Plus button
          Positioned(
            bottom: 2,
            right: 2,
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: _limeNeon,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(color: _limeNeon.withOpacity(0.5), blurRadius: 15, spreadRadius: 2)
                ],
              ),
              child: const Icon(Icons.add, color: Colors.black, size: 26),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputField(String label, String hint, FocusNode focusNode, {IconData? trailingIcon}) {
    bool isFocused = focusNode.hasFocus;
    return Container(
      decoration: BoxDecoration(
        color: _cardBg.withOpacity(0.6),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isFocused ? _limeNeon.withOpacity(0.5) : Colors.white.withOpacity(0.08),
          width: isFocused ? 1.5 : 1,
        ),
        boxShadow: isFocused ? [
          BoxShadow(color: _limeNeon.withOpacity(0.05), blurRadius: 20, spreadRadius: 0)
        ] : [],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.spaceGrotesk(
              color: _limeNeon.withOpacity(0.7),
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2
            )
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Expanded(
                child: TextField(
                  focusNode: focusNode,
                  style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w500),
                  decoration: InputDecoration(
                    hintText: hint,
                    hintStyle: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 15),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: 8),
                  ),
                ),
              ),
              if (trailingIcon != null) ...[
                const SizedBox(width: 12),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: _limeNeon.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: _limeNeon.withOpacity(0.2)),
                  ),
                  child: Icon(trailingIcon, color: _limeNeon, size: 20),
                )
              ]
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDropdownField(String label, String hint, FocusNode focusNode) {
    bool isFocused = focusNode.hasFocus;
    return Container(
      decoration: BoxDecoration(
        color: _cardBg.withOpacity(0.6),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isFocused ? _limeNeon.withOpacity(0.5) : Colors.white.withOpacity(0.08),
          width: isFocused ? 1.5 : 1,
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.spaceGrotesk(
              color: _limeNeon.withOpacity(0.7),
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2
            )
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                hint,
                style: GoogleFonts.spaceGrotesk(color: Colors.white70, fontSize: 15)
              ),
              Icon(Icons.keyboard_arrow_down_rounded, color: _limeNeon, size: 26),
            ],
          ),
          const SizedBox(height: 2),
        ],
      ),
    );
  }

  Widget _buildStockToggle() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'RASTREO DE INVENTARIO',
            style: GoogleFonts.spaceGrotesk(
              color: Colors.white70,
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.8
            )
          ),
          Transform.scale(
            scale: 0.8,
            child: Switch(
              value: _isTrackingStock,
              onChanged: (val) => setState(() => _isTrackingStock = val),
              activeColor: Colors.white,
              activeTrackColor: _limeNeon,
              inactiveThumbColor: Colors.white24,
              inactiveTrackColor: Colors.white10,
            ),
          )
        ],
      ),
    );
  }

  Widget _buildSaveButton() {
    return GestureDetector(
      onTap: () {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('¡Producto almacenado!', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold)),
            backgroundColor: _limeNeon.withOpacity(0.9),
            behavior: SnackBarBehavior.floating,
          )
        );
      },
      child: Container(
        width: double.infinity,
        height: 64,
        decoration: BoxDecoration(
          color: _limeNeon,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: _limeNeon.withOpacity(0.4),
              blurRadius: 25,
              spreadRadius: 2,
              offset: const Offset(0, 8),
            )
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.add_circle, color: Colors.black, size: 28),
            const SizedBox(width: 12),
            Text(
              'GUARDAR PRODUCTO',
              style: GoogleFonts.spaceGrotesk(
                color: Colors.black,
                fontWeight: FontWeight.w900,
                fontSize: 18,
                letterSpacing: 1.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class DashedCirclePainter extends CustomPainter {
  final Color color;
  DashedCirclePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    double dashWidth = 8, dashSpace = 6;
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke;
    
    final radius = size.width / 2;
    final center = Offset(size.width / 2, size.height / 2);
    
    double arcAngle = dashWidth / radius;
    double spaceAngle = dashSpace / radius;
    
    double startAngle = 0;
    while (startAngle < 2 * math.pi) {
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        arcAngle,
        false,
        paint,
      );
      startAngle += arcAngle + spaceAngle;
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
