import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class CloseShiftScreen extends StatefulWidget {
  const CloseShiftScreen({super.key});

  @override
  State<CloseShiftScreen> createState() => _CloseShiftScreenState();
}

class _CloseShiftScreenState extends State<CloseShiftScreen> {
  final Color _darkBg = const Color(0xFF0F0B13);
  final Color _cyanNeon = const Color(0xFF00E5FF);
  final Color _limeNeon = const Color(0xFFCCFF00);
  final Color _magentaNeon = const Color(0xFFFF00FF);

  double _swipeValue = 0.0;
  bool _isClosed = false;
  
  // Custom drawing signature points
  List<Offset?> _points = [];

  // Data
  final Map<String, dynamic> _totals = {
    'Cash': {'amount': 1250.00, 'color': const Color(0xFFCCFF00), 'icon': Icons.payments},
    'Card': {'amount': 3420.50, 'color': const Color(0xFF00E5FF), 'icon': Icons.credit_card},
    'Zelle': {'amount': 890.00, 'color': const Color(0xFFFF00FF), 'icon': Icons.send_to_mobile},
  };

  void _showCashVerification() {
    TextEditingController controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) {
        return BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: AlertDialog(
            backgroundColor: const Color(0xFF131313),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
              side: BorderSide(color: _limeNeon.withOpacity(0.5)),
            ),
            title: Text('Verificación de Efectivo', style: GoogleFonts.spaceGrotesk(color: _limeNeon, fontWeight: FontWeight.bold)),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Total esperado en sistema:\n\$1,250.00', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[400], height: 1.5)),
                const SizedBox(height: 20),
                TextField(
                  controller: controller,
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                  decoration: InputDecoration(
                    hintText: '\$0.00',
                    hintStyle: TextStyle(color: Colors.grey[600]),
                    enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: _limeNeon.withOpacity(0.2))),
                    focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: _limeNeon)),
                  ),
                ),
                const SizedBox(height: 10),
                Text('Ingrese monto en gaveta', style: TextStyle(color: Colors.grey[500], fontSize: 10)),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text('Cancelar', style: TextStyle(color: Colors.grey[500])),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: _limeNeon, foregroundColor: Colors.black),
                onPressed: () {
                  Navigator.pop(context);
                  // Simulating difference calculation
                  final input = double.tryParse(controller.text) ?? 0.0;
                  final diff = input - 1250.00;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      backgroundColor: diff == 0 ? _limeNeon : (diff < 0 ? Colors.redAccent : _cyanNeon),
                      content: Text(
                        diff == 0 ? 'Cuadre Perfecto 👌' : (diff < 0 ? 'Faltante: \$${diff.abs().toStringAsFixed(2)}' : 'Sobrante: \$${diff.abs().toStringAsFixed(2)}'),
                        style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                      ),
                    )
                  );
                },
                child: const Text('Verificar', style: TextStyle(fontWeight: FontWeight.bold)),
              )
            ],
          ),
        );
      }
    );
  }

  void _onSwipeConfirm(DragUpdateDetails details) {
    setState(() {
      _swipeValue += details.primaryDelta! / 250;
      if (_swipeValue < 0) _swipeValue = 0;
      if (_swipeValue > 1) _swipeValue = 1;

      if (_swipeValue >= 1.0 && !_isClosed) {
        _isClosed = true;
        // Trigger close shift action
        _triggerCloseAnimation();
      }
    });
  }
  
  void _onSwipeEnd(DragEndDetails details) {
    if (!_isClosed) {
      setState(() {
        _swipeValue = 0.0;
      });
    }
  }

  void _triggerCloseAnimation() {
    // Show a neat full screen glow, then pop
    showGeneralDialog(
      context: context,
      barrierColor: _cyanNeon.withOpacity(0.8),
      barrierDismissible: false,
      transitionDuration: const Duration(milliseconds: 300),
      pageBuilder: (_, __, ___) {
        return Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.check_circle, color: Colors.white, size: 80),
              const SizedBox(height: 20),
              Text('Cierre de caja exitoso', style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold, decoration: TextDecoration.none)),
              const SizedBox(height: 10),
              Text('Reporte PDF enviado al dueño', style: GoogleFonts.spaceGrotesk(color: Colors.white70, fontSize: 14, decoration: TextDecoration.none)),
            ],
          ),
        );
      }
    );
    
    // Auto close after 2 seconds
    Future.delayed(const Duration(seconds: 2), () {
      Navigator.of(context).pop(); // pop dialog
      Navigator.of(context).pop(); // pop screen
    });
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
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('RESUMEN DESGLOSADO', style: GoogleFonts.spaceGrotesk(color: Colors.grey[500], fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
                    const SizedBox(height: 16),
                    _buildPaymentCard('Cash'),
                    const SizedBox(height: 16),
                    _buildPaymentCard('Card'),
                    const SizedBox(height: 16),
                    _buildPaymentCard('Zelle'),
                    const SizedBox(height: 32),
                    
                    Text('FIRMA DIGITAL', style: GoogleFonts.spaceGrotesk(color: Colors.grey[500], fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
                    const SizedBox(height: 16),
                    _buildSignatureArea(),
                    const SizedBox(height: 40),
                    
                    Text('CONFIRMAR CIERRE', style: GoogleFonts.spaceGrotesk(color: Colors.grey[500], fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.5), textAlign: TextAlign.center),
                    const SizedBox(height: 16),
                    _buildSwipeToConfirm(),
                    const SizedBox(height: 30),
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
      padding: const EdgeInsets.all(16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: Icon(Icons.arrow_back_ios_new, color: _cyanNeon, size: 20),
            onPressed: () => Navigator.pop(context),
          ),
          Text(
            'CIERRE DE CAJA',
            style: GoogleFonts.spaceGrotesk(
              color: _cyanNeon,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              letterSpacing: 2.0,
              shadows: [BoxShadow(color: _cyanNeon.withOpacity(0.5), blurRadius: 15)]
            ),
          ),
          const SizedBox(width: 48), // Balancing spacer
        ],
      ),
    );
  }

  Widget _buildPaymentCard(String pType) {
    final data = _totals[pType];
    final color = data['color'] as Color;
    
    return Container(
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3), width: 1.5),
        boxShadow: [
          BoxShadow(color: color.withOpacity(0.1), blurRadius: 20, spreadRadius: 1)
        ]
      ),
      child: ExpansionTile(
        shape: const Border(), // remove lines
        collapsedShape: const Border(),
        tilePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: color.withOpacity(0.2), shape: BoxShape.circle),
          child: Icon(data['icon'], color: color),
        ),
        title: Text(pType == 'Cash' ? 'Efectivo (Cash)' : (pType == 'Card' ? 'Tarjeta (Card)' : 'Zelle / Transfer'), 
          style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
        subtitle: Text('Toca para expandir transacciones', style: TextStyle(color: Colors.grey[500], fontSize: 10)),
        trailing: Text('\$${data['amount'].toStringAsFixed(2)}', 
          style: GoogleFonts.spaceGrotesk(color: color, fontSize: 18, fontWeight: FontWeight.bold, shadows: [BoxShadow(color: color.withOpacity(0.5), blurRadius: 10)])),
        children: [
          const Divider(color: Colors.white12, height: 1),
          if (pType == 'Cash')
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: ElevatedButton.icon(
                icon: const Icon(Icons.fact_check_outlined, color: Colors.black),
                label: const Text('Comprobar Billetes Físicos', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _limeNeon,
                  minimumSize: const Size(double.infinity, 45),
                ),
                onPressed: _showCashVerification,
              ),
            ),
          // Mock transactions list
          ListTile(
            title: Text('Venta #1024', style: TextStyle(color: Colors.grey[300], fontSize: 12)),
            trailing: Text('\$24.50', style: TextStyle(color: color, fontWeight: FontWeight.bold)),
          ),
          ListTile(
            title: Text('Venta #1026', style: TextStyle(color: Colors.grey[300], fontSize: 12)),
            trailing: Text('\$15.00', style: TextStyle(color: color, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _buildSignatureArea() {
    return Container(
      height: 150,
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Stack(
        children: [
          if (_points.isEmpty)
            Center(child: Text('Firma del Encargado aquí...', style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 18))),
          GestureDetector(
            onPanUpdate: (details) {
              RenderBox renderBox = context.findRenderObject() as RenderBox;
              setState(() {
                _points.add(renderBox.globalToLocal(details.globalPosition) - const Offset(20, 480)); // Rough offset adjustment for safety given its position
              });
            },
            onPanEnd: (details) {
              _points.add(null);
            },
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: CustomPaint(
                painter: SignaturePainter(points: _points),
                size: Size.infinite,
              ),
            ),
          ),
          Positioned(
            right: 10,
            bottom: 10,
            child: IconButton(
              icon: Icon(Icons.clear, color: Colors.white30),
              onPressed: () => setState(() => _points.clear()),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildSwipeToConfirm() {
    return Container(
      height: 60,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: _cyanNeon.withOpacity(0.3)),
      ),
      child: Stack(
        alignment: Alignment.centerLeft,
        children: [
          Center(
            child: Opacity(
              opacity: 1.0 - _swipeValue,
              child: Text(
                'DESLIZA PARA CERRAR TURNO >>>',
                style: GoogleFonts.spaceGrotesk(color: _cyanNeon.withOpacity(0.8), fontWeight: FontWeight.bold, letterSpacing: 1.0),
              ),
            ),
          ),
          FractionallySizedBox(
            widthFactor: _swipeValue,
            heightFactor: 1.0,
            child: Container(
              decoration: BoxDecoration(
                color: _cyanNeon.withOpacity(0.2),
                borderRadius: BorderRadius.circular(30),
              ),
            ),
          ),
          Align(
            alignment: Alignment( -1.0 + (_swipeValue * 2), 0.0 ),
            child: GestureDetector(
              onHorizontalDragUpdate: _onSwipeConfirm,
              onHorizontalDragEnd: _onSwipeEnd,
              child: Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: _cyanNeon,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(color: _cyanNeon.withOpacity(0.5), blurRadius: 15, spreadRadius: 2)
                  ]
                ),
                child: const Icon(Icons.lock_outline, color: Colors.black, size: 28),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class SignaturePainter extends CustomPainter {
  final List<Offset?> points;

  SignaturePainter({required this.points});

  @override
  void paint(Canvas canvas, Size size) {
    Paint paint = Paint()
      ..color = Colors.white
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 3.0
      ..maskFilter = const MaskFilter.blur(BlurStyle.solid, 2.0); // Neon glow effect

    for (int i = 0; i < points.length - 1; i++) {
      if (points[i] != null && points[i + 1] != null) {
        canvas.drawLine(points[i]!, points[i + 1]!, paint);
        
        // Add glow
        Paint glowPaint = Paint()
           ..color = const Color(0xFF00E5FF).withOpacity(0.3)
           ..strokeCap = StrokeCap.round
           ..strokeWidth = 8.0
           ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 5.0);
        canvas.drawLine(points[i]!, points[i + 1]!, glowPaint);
      }
    }
  }

  @override
  bool shouldRepaint(SignaturePainter oldDelegate) => true;
}
