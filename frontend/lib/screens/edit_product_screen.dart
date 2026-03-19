import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../components/glass_card.dart';

class EditProductScreen extends StatefulWidget {
  const EditProductScreen({super.key});

  @override
  State<EditProductScreen> createState() => _EditProductScreenState();
}

class _EditProductScreenState extends State<EditProductScreen> with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _glowController;
  
  final TextEditingController _nameController = TextEditingController(text: 'Hyper-X Neon Runner');
  final TextEditingController _skuController = TextEditingController(text: 'HX-NR-2024-BLZ');
  final TextEditingController _priceController = TextEditingController(text: '299.00');
  
  String _selectedCategory = 'Footwear';
  FocusNode? _activeFocusNode;
  
  final Color darkBg = const Color(0xFF070907);
  final Color limeNeon = const Color(0xFF8CFF00);
  final Color cyanNeon = const Color(0xFF00FBFF);
  final Color magentaNeon = const Color(0xFFFF00FF);
  final Color redNeon = const Color(0xFFFF3131);

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _glowController.dispose();
    _nameController.dispose();
    _skuController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  void _showImageMenu() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: const Color(0xFF141714).withOpacity(0.9),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
          border: Border.all(color: magentaNeon.withOpacity(0.2)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildMenuOption('Tomar nueva foto', Icons.camera_alt_rounded, magentaNeon),
            const SizedBox(height: 16),
            _buildMenuOption('Elegir de galería', Icons.photo_library_rounded, magentaNeon),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuOption(String label, IconData icon, Color color) {
    return GestureDetector(
      onTap: () => Navigator.pop(context),
      child: GlassCard(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
        child: Row(
          children: [
            Icon(icon, color: color),
            const SizedBox(width: 16),
            Text(
              label,
              style: GoogleFonts.orbitron(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  void _showDeleteConfirmation() {
    double slideValue = 0.0;
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          backgroundColor: Colors.transparent,
          content: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: darkBg,
              borderRadius: BorderRadius.circular(30),
              border: Border.all(color: redNeon.withOpacity(0.3)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.warning_amber_rounded, color: redNeon, size: 48),
                const SizedBox(height: 16),
                Text(
                  '¿ELIMINAR PRODUCTO?',
                  style: GoogleFonts.orbitron(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 24),
                Text(
                  'Esta acción no se puede deshacer.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.spaceGrotesk(color: Colors.white70),
                ),
                const SizedBox(height: 32),
                // Slide to Delete
                Container(
                  height: 60,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: Stack(
                    children: [
                      Center(
                        child: Text(
                          'DESLIZA PARA ELIMINAR',
                          style: GoogleFonts.orbitron(
                            color: Colors.white24,
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      Positioned(
                        left: slideValue * (MediaQuery.of(context).size.width * 0.5),
                        child: GestureDetector(
                          onHorizontalDragUpdate: (details) {
                            setState(() {
                              slideValue = (slideValue + details.delta.dx / 200).clamp(0.0, 1.0);
                              if (slideValue == 1.0) {
                                Navigator.pop(context);
                                Navigator.pop(context);
                              }
                            });
                          },
                          child: Container(
                            width: 50,
                            height: 50,
                            margin: const EdgeInsets.all(5),
                            decoration: BoxDecoration(
                              color: redNeon,
                              shape: BoxShape.circle,
                              boxShadow: [BoxShadow(color: redNeon.withOpacity(0.5), blurRadius: 10)],
                            ),
                            child: const Icon(Icons.chevron_right_rounded, color: Colors.black),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text('CANCELAR', style: GoogleFonts.spaceGrotesk(color: Colors.white38)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: darkBg,
      body: Stack(
        children: [
          SafeArea(
            child: Column(
              children: [
                _buildHeader(context),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildImageEdition(),
                        const SizedBox(height: 32),
                        _buildNeonTextField('NOMBRE DEL PRODUCTO', _nameController, cyanNeon),
                        const SizedBox(height: 20),
                        _buildNeonTextField('ID SKU', _skuController, cyanNeon, suffixIcon: Icons.qr_code_scanner_rounded),
                        const SizedBox(height: 20),
                        Row(
                          children: [
                            Expanded(child: _buildCategoryDropdown()),
                            const SizedBox(width: 16),
                            Expanded(child: _buildNeonTextField('PRECIO (USD)', _priceController, limeNeon, prefixText: '\$ ')),
                          ],
                        ),
                        const SizedBox(height: 48),
                        _buildUpdateBtn(),
                        const SizedBox(height: 16),
                        _buildDeleteBtn(),
                        const SizedBox(height: 100),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Success burst overlay mock
          IgnorePointer(
            child: Container(
              decoration: BoxDecoration(
                border: Border.all(color: limeNeon.withOpacity(0.0), width: 3),
              ),
            ),
          ),
        ],
      ),
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
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          ),
          Text(
            'EDITAR PRODUCTO',
            style: GoogleFonts.orbitron(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
          ),
          const SizedBox(width: 48),
        ],
      ),
    );
  }

  Widget _buildImageEdition() {
    return GestureDetector(
      onTap: _showImageMenu,
      child: Center(
        child: AnimatedBuilder(
          animation: _pulseController,
          builder: (context, child) {
            return Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(30),
                border: Border.all(
                  color: magentaNeon.withOpacity(0.3 + (_pulseController.value * 0.4)),
                  width: 2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: magentaNeon.withOpacity(0.1 + (_pulseController.value * 0.2)),
                    blurRadius: 20 + (_pulseController.value * 20),
                    spreadRadius: _pulseController.value * 5,
                  )
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(28),
                child: Stack(
                  children: [
                    Image.network(
                      'https://via.placeholder.com/250x250/141714/FFFFFF?text=Product+Image',
                      fit: BoxFit.cover,
                    ),
                    Container(
                      color: Colors.black45,
                      child: Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.camera_enhance_rounded, color: magentaNeon, size: 40),
                            const SizedBox(height: 8),
                            Text(
                              'CAMBIAR IMAGEN',
                              style: GoogleFonts.orbitron(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildNeonTextField(String label, TextEditingController controller, Color color, {IconData? suffixIcon, String? prefixText}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.orbitron(color: color.withOpacity(0.8), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.5),
        ),
        const SizedBox(height: 8),
        Focus(
          onFocusChange: (hasFocus) {
            setState(() {
              // Trigger depth glow effect logic
            });
          },
          child: Container(
            decoration: BoxDecoration(
              boxShadow: [
                BoxShadow(
                  color: color.withOpacity(0.05),
                  blurRadius: 15,
                  spreadRadius: 2,
                )
              ],
            ),
            child: TextField(
              controller: controller,
              style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                prefixText: prefixText,
                prefixStyle: GoogleFonts.spaceGrotesk(color: color, fontWeight: FontWeight.bold),
                suffixIcon: suffixIcon != null ? Icon(suffixIcon, color: color, size: 20) : null,
                filled: true,
                fillColor: const Color(0xFF141714).withOpacity(0.6),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(15),
                  borderSide: BorderSide(color: Colors.white.withOpacity(0.05)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(15),
                  borderSide: BorderSide(color: color, width: 1.5),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCategoryDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'CATEGORÍA',
          style: GoogleFonts.orbitron(color: cyanNeon.withOpacity(0.8), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.5),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          decoration: BoxDecoration(
            color: const Color(0xFF141714).withOpacity(0.6),
            borderRadius: BorderRadius.circular(15),
            border: Border.all(color: Colors.white.withOpacity(0.05)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _selectedCategory,
              dropdownColor: const Color(0xFF141714),
              style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold),
              icon: Icon(Icons.keyboard_arrow_down_rounded, color: cyanNeon),
              items: ['Footwear', 'Electronics', 'Apparel', 'Accessories'].map((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Text(value),
                );
              }).toList(),
              onChanged: (val) => setState(() => _selectedCategory = val!),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildUpdateBtn() {
    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        return GestureDetector(
          onTap: () {
            // Success animation mock
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                backgroundColor: limeNeon,
                content: Text('DATOS ACTUALIZADOS', style: GoogleFonts.orbitron(color: Colors.black, fontWeight: FontWeight.w900)),
              ),
            );
          },
          child: Container(
            width: double.infinity,
            height: 65,
            decoration: BoxDecoration(
              color: limeNeon,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: limeNeon.withOpacity(0.3 + (_pulseController.value * 0.2)),
                  blurRadius: 15 + (_pulseController.value * 10),
                  spreadRadius: _pulseController.value * 2,
                )
              ],
            ),
            alignment: Alignment.center,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'ACTUALIZAR CAMBIOS',
                  style: GoogleFonts.orbitron(color: Colors.black, fontSize: 14, fontWeight: FontWeight.w900),
                ),
                const SizedBox(width: 12),
                const Icon(Icons.sync_rounded, color: Colors.black),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildDeleteBtn() {
    return GestureDetector(
      onTap: _showDeleteConfirmation,
      child: Container(
        width: double.infinity,
        height: 60,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: redNeon.withOpacity(0.3)),
        ),
        alignment: Alignment.center,
        child: Text(
          'ELIMINAR PRODUCTO',
          style: GoogleFonts.orbitron(color: redNeon.withOpacity(0.7), fontSize: 12, fontWeight: FontWeight.w900),
        ),
      ),
    );
  }
}
