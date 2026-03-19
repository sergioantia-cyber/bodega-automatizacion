import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/client.dart';
import '../../services/client_service.dart';

class AddClientFormTab extends StatefulWidget {
  final VoidCallback onClientAdded;

  const AddClientFormTab({super.key, required this.onClientAdded});

  @override
  State<AddClientFormTab> createState() => _AddClientFormTabState();
}

class _AddClientFormTabState extends State<AddClientFormTab> {
  final ClientService _clientService = ClientService();
  final Color _cardBg = const Color(0xFF141714);
  final Color _magentaNeon = const Color(0xFFFF00FF);
  final Color _cyanNeon = const Color(0xFF00FBFF);
  final Color _limeNeon = const Color(0xFF8CFF00);

  bool _isLoading = false;

  final TextEditingController _nameCtrl = TextEditingController();
  final TextEditingController _docCtrl = TextEditingController();
  final TextEditingController _phoneCtrl = TextEditingController();
  final TextEditingController _emailCtrl = TextEditingController();
  final TextEditingController _addressCtrl = TextEditingController();

  final FocusNode _nameFocus = FocusNode();
  final FocusNode _docFocus = FocusNode();
  final FocusNode _phoneFocus = FocusNode();
  final FocusNode _emailFocus = FocusNode();
  final FocusNode _addressFocus = FocusNode();

  @override
  void initState() {
    super.initState();
    for (var f in [_nameFocus, _docFocus, _phoneFocus, _emailFocus, _addressFocus]) {
      f.addListener(() => setState(() {}));
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _docCtrl.dispose();
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    _addressCtrl.dispose();
    for (var f in [_nameFocus, _docFocus, _phoneFocus, _emailFocus, _addressFocus]) {
      f.dispose();
    }
    super.dispose();
  }

  Future<void> _saveClient() async {
    if (_nameCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('El nombre es obligatorio', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold)), backgroundColor: Colors.red),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      final client = Client(
        name: _nameCtrl.text,
        document: _docCtrl.text.isNotEmpty ? _docCtrl.text : null,
        phone: _phoneCtrl.text.isNotEmpty ? _phoneCtrl.text : null,
        email: _emailCtrl.text.isNotEmpty ? _emailCtrl.text : null,
        address: _addressCtrl.text.isNotEmpty ? _addressCtrl.text : null,
      );

      await _clientService.addClient(client);

      if (mounted) {
        setState(() => _isLoading = false);
        // Clear fields
        _nameCtrl.clear();
        _docCtrl.clear();
        _phoneCtrl.clear();
        _emailCtrl.clear();
        _addressCtrl.clear();

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('¡Cliente registrado exitosamente!', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold)),
            backgroundColor: _cyanNeon.withOpacity(0.9),
          ),
        );
        widget.onClientAdded();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al guardar: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.person_add_alt_1_rounded, color: _magentaNeon, size: 28),
              const SizedBox(width: 12),
              Text(
                'REGISTRO NUEVO CLIENTE',
                style: GoogleFonts.orbitron(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          _buildInputField('NOMBRE COMPLETO', 'ej. Maria Gonzalez', _nameCtrl, _nameFocus, _cyanNeon),
          const SizedBox(height: 20),
          _buildInputField('CÉDULA / DNI', 'ej. V-12345678', _docCtrl, _docFocus, _cyanNeon),
          const SizedBox(height: 20),
          _buildInputField('TELÉFONO', 'ej. 0414-1234567', _phoneCtrl, _phoneFocus, _magentaNeon, isNumeric: true),
          const SizedBox(height: 20),
          _buildInputField('CORREO ELECTRÓNICO', 'ej. maria@correo.com', _emailCtrl, _emailFocus, _cyanNeon),
          const SizedBox(height: 20),
          _buildInputField('DIRECCIÓN', 'Dirección física completa', _addressCtrl, _addressFocus, _cyanNeon),
          const SizedBox(height: 48),
          _buildSaveButton(),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildInputField(String label, String hint, TextEditingController controller, FocusNode focusNode, Color themeColor, {bool isNumeric = false}) {
    bool isFocused = focusNode.hasFocus;
    return Container(
      decoration: BoxDecoration(
        color: _cardBg.withOpacity(0.6),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isFocused ? themeColor.withOpacity(0.5) : Colors.white.withOpacity(0.08),
          width: isFocused ? 1.5 : 1,
        ),
        boxShadow: isFocused ? [
          BoxShadow(color: themeColor.withOpacity(0.05), blurRadius: 20, spreadRadius: 0)
        ] : [],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.spaceGrotesk(
              color: themeColor.withOpacity(0.7),
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2
            )
          ),
          const SizedBox(height: 4),
          TextField(
            controller: controller,
            focusNode: focusNode,
            keyboardType: isNumeric ? TextInputType.phone : TextInputType.text,
            style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w500),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 15),
              border: InputBorder.none,
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(vertical: 8),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSaveButton() {
    return GestureDetector(
      onTap: _isLoading ? null : _saveClient,
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
            if (_isLoading)
              const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 3))
            else
              const Icon(Icons.check_circle_rounded, color: Colors.black, size: 28),
            const SizedBox(width: 12),
            Text(
              _isLoading ? 'GUARDANDO...' : 'SAVE CUSTOMER',
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
