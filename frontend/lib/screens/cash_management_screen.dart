import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../components/glass_card.dart';

class CashManagementScreen extends StatefulWidget {
  const CashManagementScreen({super.key});

  @override
  State<CashManagementScreen> createState() => _CashManagementScreenState();
}

class _CashManagementScreenState extends State<CashManagementScreen> {
  final Color _darkBg = const Color(0xFF070907);
  final Color _limeNeon = const Color(0xFF8CFF00);
  final Color _cyanNeon = const Color(0xFF00FBFF);
  final Color _magentaNeon = const Color(0xFFFF00FF);
  final Color _cardBg = const Color(0xFF141714);

  final double _systemTotal = 1250.50;
  double _manualCash = 0.0;
  final TextEditingController _cashController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    double difference = _manualCash - _systemTotal;

    return Scaffold(
      backgroundColor: _darkBg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('ARQUEO DE CAJA', style: GoogleFonts.orbitron(fontWeight: FontWeight.w900, fontSize: 16)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            _buildSystemTotals(),
            const SizedBox(height: 24),
            _buildManualInput(),
            const SizedBox(height: 24),
            _buildComparison(difference),
            const SizedBox(height: 40),
            _buildCloseShiftButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildSystemTotals() {
    return GlassCard(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Text('SALDO ESPERADO (SISTEMA)', style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontWeight: FontWeight.bold, fontSize: 12)),
          const SizedBox(height: 12),
          Text('\$${_systemTotal.toStringAsFixed(2)}', 
            style: GoogleFonts.orbitron(color: _cyanNeon, fontSize: 32, fontWeight: FontWeight.w900, shadows: [Shadow(color: _cyanNeon.withOpacity(0.5), blurRadius: 20)])
          ),
          const SizedBox(height: 24),
          const Divider(color: Colors.white10),
          const SizedBox(height: 16),
          _buildMethodRow('EFECTIVO', '\$850.50', _limeNeon),
          _buildMethodRow('NEQUI/BANCO', '\$300.00', _magentaNeon),
          _buildMethodRow('TARJETAS', '\$100.00', _cyanNeon),
        ],
      ),
    );
  }

  Widget _buildMethodRow(String label, String value, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.spaceGrotesk(color: Colors.white54, fontSize: 12, fontWeight: FontWeight.bold)),
          Text(value, style: GoogleFonts.spaceGrotesk(color: color, fontSize: 14, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }

  Widget _buildManualInput() {
    return GlassCard(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Text('EFECTIVO REAL EN CAJÓN', style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 20),
          TextField(
            controller: _cashController,
            keyboardType: TextInputType.number,
            onChanged: (val) => setState(() => _manualCash = double.tryParse(val) ?? 0.0),
            textAlign: TextAlign.center,
            style: GoogleFonts.orbitron(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
            decoration: InputDecoration(
              prefixText: '\$ ',
              prefixStyle: GoogleFonts.orbitron(color: _limeNeon, fontSize: 24),
              hintText: '0.00',
              hintStyle: GoogleFonts.orbitron(color: Colors.white10, fontSize: 24),
              enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white12)),
              focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: _limeNeon, width: 2)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildComparison(double diff) {
    Color statusColor = diff == 0 ? _limeNeon : (diff > 0 ? _cyanNeon : const Color(0xFFFF2D55));
    String statusText = diff == 0 ? 'CAJA CUADRADA' : (diff > 0 ? 'SOBRANTE' : 'FALTANTE');

    return GlassCard(
      padding: const EdgeInsets.all(24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('DIFERENCIA', style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 12, fontWeight: FontWeight.bold)),
              Text('\$${diff.abs().toStringAsFixed(2)}', style: GoogleFonts.orbitron(color: statusColor, fontSize: 20, fontWeight: FontWeight.w900)),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(12), border: Border.all(color: statusColor.withOpacity(0.3))),
            child: Text(statusText, style: GoogleFonts.orbitron(color: statusColor, fontSize: 10, fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }

  Widget _buildCloseShiftButton() {
    return GestureDetector(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Turno Cerrado Exitosamente'), backgroundColor: _limeNeon));
        Navigator.pop(context);
      },
      child: Container(
        height: 65,
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: _limeNeon.withOpacity(0.5)),
          boxShadow: [BoxShadow(color: _limeNeon.withOpacity(0.1), blurRadius: 20)],
        ),
        child: Center(
          child: Text('CERRAR TURNO Y GUARDAR', style: GoogleFonts.orbitron(color: _limeNeon, fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 1.5)),
        ),
      ),
    );
  }
}
