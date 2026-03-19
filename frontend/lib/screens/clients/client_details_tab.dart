import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../components/glass_card.dart';
import '../../models/client.dart';
import '../../services/client_service.dart';

class ClientDetailsTab extends StatefulWidget {
  final Client? client;
  final VoidCallback onDebtUpdated;
  final VoidCallback onBackPressed;

  const ClientDetailsTab({
    super.key,
    required this.client,
    required this.onDebtUpdated,
    required this.onBackPressed,
  });

  @override
  State<ClientDetailsTab> createState() => _ClientDetailsTabState();
}

class _ClientDetailsTabState extends State<ClientDetailsTab> {
  final ClientService _clientService = ClientService();
  final Color _magentaNeon = const Color(0xFFFF00FF);
  final Color _cyanNeon = const Color(0xFF00FBFF);
  final Color _limeNeon = const Color(0xFF8CFF00);
  final Color _cardBg = const Color(0xFF141714);

  final TextEditingController _abonoCtrl = TextEditingController();
  bool _isProcessing = false;

  @override
  void dispose() {
    _abonoCtrl.dispose();
    super.dispose();
  }

  void _showAbonoDialog() {
    if (widget.client == null) return;
    _abonoCtrl.clear();

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: _cardBg,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: BorderSide(color: _limeNeon.withOpacity(0.5)),
          ),
          title: Text('MAKE REPAYMENT', style: GoogleFonts.orbitron(color: _limeNeon, fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Deuda actual: \$${widget.client!.debt.toStringAsFixed(2)}', style: GoogleFonts.spaceGrotesk(color: Colors.white70)),
              const SizedBox(height: 20),
              TextField(
                controller: _abonoCtrl,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                decoration: InputDecoration(
                  prefixText: '\$ ',
                  prefixStyle: GoogleFonts.spaceGrotesk(color: _magentaNeon, fontSize: 24),
                  hintText: '0.00',
                  hintStyle: TextStyle(color: Colors.white24),
                  enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                  focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: _limeNeon)),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text('CANCELAR', style: GoogleFonts.spaceGrotesk(color: Colors.white54)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: _limeNeon,
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () async {
                final double? abono = double.tryParse(_abonoCtrl.text);
                if (abono != null && abono > 0) {
                  Navigator.pop(ctx);
                  await _processAbono(abono);
                }
              },
              child: Text('CONFIRMAR ABONO', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  Future<void> _processAbono(double amount) async {
    if (widget.client == null || widget.client!.id == null) return;
    
    setState(() => _isProcessing = true);
    
    try {
      final newDebt = widget.client!.debt - amount;
      final actualDebt = newDebt < 0 ? 0.0 : newDebt;
      
      final clientUpdate = Client(
        id: widget.client!.id,
        name: widget.client!.name,
        document: widget.client!.document,
        phone: widget.client!.phone,
        email: widget.client!.email,
        address: widget.client!.address,
        debt: actualDebt,
        points: widget.client!.points,
        notes: widget.client!.notes,
      );

      await _clientService.updateClient(clientUpdate);

      widget.client!.debt = actualDebt;
      widget.onDebtUpdated(); 

      if (mounted) {
        setState(() => _isProcessing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Abono registrado exitosamente. Nueva deuda: \$${actualDebt.toStringAsFixed(2)}', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold)),
            backgroundColor: _cyanNeon.withOpacity(0.9), // Cian para éxito de abono
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isProcessing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al procesar: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.client == null) {
      return Scaffold(
        backgroundColor: Colors.transparent,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.person_search_rounded, size: 80, color: Colors.white.withOpacity(0.05)),
              const SizedBox(height: 24),
              Text(
                'SELECCIONE UN CLIENTE',
                style: GoogleFonts.orbitron(
                  color: Colors.white24,
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Búsquelo en el directorio para ver sus detalles y crédito.',
                style: GoogleFonts.spaceGrotesk(color: Colors.white38),
              )
            ],
          ),
        ),
      );
    }

    final c = widget.client!;
    final bool hasDebt = c.debt > 0;

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Iniciar nueva venta vinculada a este cliente
          Navigator.pushNamed(context, '/checkout', arguments: c);
        },
        backgroundColor: _cyanNeon,
        child: const Icon(Icons.shopping_cart_checkout_rounded, color: Colors.black, size: 28),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            GestureDetector(
              onTap: widget.onBackPressed,
              child: Row(
                children: [
                  Icon(Icons.arrow_back_ios_new_rounded, color: _cyanNeon, size: 16),
                  const SizedBox(width: 8),
                  Text('VOLVER AL DIRECTORIO', style: GoogleFonts.spaceGrotesk(color: _cyanNeon, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            GlassCard(
              padding: const EdgeInsets.all(24),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: _cyanNeon.withOpacity(0.15),
                    radius: 36,
                    child: Text(c.name[0].toUpperCase(), style: GoogleFonts.orbitron(color: _cyanNeon, fontSize: 32, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(width: 24),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(c.name, style: GoogleFonts.orbitron(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        Text('ID / C.I: ${c.document ?? 'No especificado'}', style: GoogleFonts.spaceGrotesk(color: _cyanNeon, fontSize: 13, fontWeight: FontWeight.w600)),
                        Text('Tel: ${c.phone ?? 'No especificado'}', style: GoogleFonts.spaceGrotesk(color: Colors.white70, fontSize: 13)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: GlassCard(
                    padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                    child: Column(
                      children: [
                        Text('ESTADO DE CUENTA', style: GoogleFonts.spaceGrotesk(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
                        const SizedBox(height: 12),
                        Text('\$${c.debt.toStringAsFixed(2)}', style: GoogleFonts.orbitron(color: hasDebt ? _magentaNeon : _limeNeon, fontSize: 26, fontWeight: FontWeight.w900)),
                        const SizedBox(height: 4),
                        Text(hasDebt ? 'TOTAL DEBT' : 'SOLVENTE', style: GoogleFonts.spaceGrotesk(color: hasDebt ? _magentaNeon : _limeNeon, fontSize: 12, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: GlassCard(
                    padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                    child: Column(
                      children: [
                        Text('PUNTOS FIDELIDAD', style: GoogleFonts.spaceGrotesk(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
                        const SizedBox(height: 12),
                        Text('${c.points}', style: GoogleFonts.orbitron(color: _cyanNeon, fontSize: 26, fontWeight: FontWeight.w900)),
                        const SizedBox(height: 4),
                        Text('PTS', style: GoogleFonts.spaceGrotesk(color: _cyanNeon, fontSize: 12, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _limeNeon.withOpacity(0.15),
                      foregroundColor: _limeNeon,
                      side: BorderSide(color: _limeNeon, width: 1.5),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      elevation: 0,
                    ),
                    onPressed: _isProcessing ? null : _showAbonoDialog,
                    icon: _isProcessing 
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.payment_rounded, size: 20),
                    label: Text('MAKE REPAYMENT', style: GoogleFonts.orbitron(fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _cyanNeon.withOpacity(0.15),
                      foregroundColor: _cyanNeon,
                      side: BorderSide(color: _cyanNeon, width: 1.5),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      elevation: 0,
                    ),
                    onPressed: () {
                      // TODO: Implement Edit Form
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Función de editar info en desarrollo')));
                    },
                    icon: const Icon(Icons.edit_note_rounded, size: 20),
                    label: Text('EDIT INFO', style: GoogleFonts.orbitron(fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 32),
            Text('HISTORIAL DE TRANSACCIONES', style: GoogleFonts.spaceGrotesk(color: Colors.white54, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1)),
            const SizedBox(height: 16),
            
            // Mock History List
            _buildHistoryItem('Venta #1024', DateTime.now().subtract(const Duration(days: 2)), 25.50, isAbono: false),
            _buildHistoryItem('Abono en Efectivo', DateTime.now().subtract(const Duration(days: 5)), 15.00, isAbono: true),
            _buildHistoryItem('Venta #0988', DateTime.now().subtract(const Duration(days: 12)), 45.00, isAbono: false),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryItem(String title, DateTime date, double amount, {required bool isAbono}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(
                isAbono ? Icons.arrow_downward_rounded : Icons.shopping_bag_rounded,
                color: isAbono ? _cyanNeon : _limeNeon,
                size: 20,
              ),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold)),
                  Text('${date.day}/${date.month}/${date.year}', style: GoogleFonts.spaceGrotesk(color: Colors.white38, fontSize: 11)),
                ],
              ),
            ],
          ),
          Text(
            '${isAbono ? "-" : "+"}\$${amount.toStringAsFixed(2)}',
            style: GoogleFonts.orbitron(
              color: isAbono ? _cyanNeon : _limeNeon,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: _cyanNeon.withOpacity(0.7), size: 20),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: GoogleFonts.spaceGrotesk(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(value, style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 14)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
