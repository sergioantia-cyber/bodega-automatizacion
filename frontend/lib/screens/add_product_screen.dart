import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:math' as math;
import 'dart:typed_data';
import 'package:image_picker/image_picker.dart';
import '../services/product_service.dart';
import '../models/product.dart';

class AddProductScreen extends StatefulWidget {
  final String? initialBarcode;
  const AddProductScreen({super.key, this.initialBarcode});

  @override
  State<AddProductScreen> createState() => _AddProductScreenState();
}

class _AddProductScreenState extends State<AddProductScreen> {
  final ProductService _productService = ProductService();
  final Color _darkBg = const Color(0xFF070907); // Darker background
  final Color _limeNeon = const Color(0xFF8CFF00); // More vibrant lime
  final Color _cyanNeon = const Color(0xFF00FBFF); // Vibrante cyan
  final Color _cardBg = const Color(0xFF141714); // Container bg

  bool _isTrackingStock = true;
  bool _isLoading = false;
  
  // Image handling
  final ImagePicker _picker = ImagePicker();
  Uint8List? _imageBytes;
  String? _imageUrl;
  
  // Controllers
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _catController = TextEditingController();
  final TextEditingController _skuController = TextEditingController();
  final TextEditingController _costController = TextEditingController();
  final TextEditingController _saleController = TextEditingController();
  // Optional stock
  final TextEditingController _stockController = TextEditingController(text: '0');

  // Focus nodes
  final FocusNode _nameFocus = FocusNode();
  final FocusNode _catFocus = FocusNode();
  final FocusNode _skuFocus = FocusNode();
  final FocusNode _costFocus = FocusNode();
  final FocusNode _saleFocus = FocusNode();
  final FocusNode _stockFocus = FocusNode();

  List<String> _categories = ['Alimentos', 'Bebidas', 'Limpieza', 'Lácteos', 'Charcutería', 'Cosméticos', 'General'];

  @override
  void initState() {
    super.initState();
    _loadCategories();
    _catController.text = 'General';
    if (widget.initialBarcode != null) {
      _skuController.text = widget.initialBarcode!;
    }
    _nameFocus.addListener(() => setState(() {}));
    _catFocus.addListener(() => setState(() {}));
    _skuFocus.addListener(() => setState(() {}));
    _costFocus.addListener(() => setState(() {}));
    _saleFocus.addListener(() => setState(() {}));
    _stockFocus.addListener(() => setState(() {}));
  }

  Future<void> _loadCategories() async {
    try {
      final dbCategories = await _productService.getCategories();
      if (mounted && dbCategories.isNotEmpty) {
        setState(() {
          // Merge default with DB ones, keeping unique
          final Set<String> allCats = {..._categories, ...dbCategories};
          _categories = allCats.toList();
          _categories.sort();
        });
      }
    } catch (e) {
      print('Error loading cats: $e');
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _catController.dispose();
    _skuController.dispose();
    _costController.dispose();
    _saleController.dispose();
    _stockController.dispose();

    _nameFocus.dispose();
    _catFocus.dispose();
    _skuFocus.dispose();
    _costFocus.dispose();
    _saleFocus.dispose();
    _stockFocus.dispose();
    super.dispose();
  }

  Future<void> _saveProduct() async {
    if (_nameController.text.isEmpty || _saleController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('El nombre y el precio de venta son obligatorios', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold)), backgroundColor: Colors.red),
      );
      return;
    }

    setState(() => _isLoading = true);
    
    try {
      final double price = double.tryParse(_saleController.text) ?? 0.0;
      final int stock = int.tryParse(_stockController.text) ?? 0;
      final double costPrice = double.tryParse(_costController.text) ?? 0.0;

      final product = Product(
        name: _nameController.text,
        price: price,
        stock: stock,
        active: true,
        category: _catController.text,
        barcode: _skuController.text,
        cost: costPrice,
        imageUrl: _imageUrl,
      );

      await _productService.addProduct(product);

      if (mounted) {
        setState(() => _isLoading = false);
        Navigator.pop(context, true); // Return true indicating success
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('¡Producto almacenado!', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold)),
            backgroundColor: _limeNeon.withOpacity(0.9),
            behavior: SnackBarBehavior.floating,
          )
        );
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
                    GestureDetector(
                      onTap: _pickImage,
                      child: _buildImageUpload(),
                    ),
                    const SizedBox(height: 48),
                    _buildInputField('NOMBRE DEL PRODUCTO', 'ej. Cyber Energy Drink', _nameController, _nameFocus),
                    const SizedBox(height: 20),
                    _buildCategoryDropdown(),
                    const SizedBox(height: 20),
                    _buildInputField('SKU / CÓDIGO BARRAS', 'Escanear o teclear', _skuController, _skuFocus, trailingIcon: Icons.qr_code_scanner),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(child: _buildInputField('COSTO', 'COP 0.00', _costController, _costFocus, isNumeric: true)),
                        const SizedBox(width: 16),
                        Expanded(child: _buildInputField('PRECIO VENTA', 'COP 0.00', _saleController, _saleFocus, isNumeric: true)),
                      ],
                    ),
                    const SizedBox(height: 20),
                    _buildInputField('STOCK INICIAL', '0', _stockController, _stockFocus, isNumeric: true),
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

  Widget _buildCategoryDropdown() {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              decoration: BoxDecoration(
                color: _cardBg.withOpacity(0.6),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: _catFocus.hasFocus ? _limeNeon.withOpacity(0.5) : Colors.white.withOpacity(0.08),
                  width: _catFocus.hasFocus ? 1.5 : 1,
                ),
                boxShadow: _catFocus.hasFocus ? [
                  BoxShadow(color: _limeNeon.withOpacity(0.05), blurRadius: 20, spreadRadius: 0)
                ] : [],
              ),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'CATEGORÍA',
                    style: GoogleFonts.spaceGrotesk(
                      color: _limeNeon.withOpacity(0.7),
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.2
                    )
                  ),
                  const SizedBox(height: 4),
                  Autocomplete<String>(
                    optionsBuilder: (TextEditingValue textEditingValue) {
                      if (textEditingValue.text.isEmpty) {
                        return _categories;
                      }
                      return _categories.where((String option) {
                        return option.toLowerCase().contains(textEditingValue.text.toLowerCase());
                      });
                    },
                    onSelected: (String selection) {
                      _catController.text = selection;
                      FocusScope.of(context).unfocus();
                    },
                    fieldViewBuilder: (context, textController, focusNode, onFieldSubmitted) {
                      if (textController.text.isEmpty && _catController.text.isNotEmpty) {
                        textController.text = _catController.text;
                      }
                      
                      textController.addListener(() {
                        _catController.text = textController.text;
                      });

                      return TextField(
                        controller: textController,
                        focusNode: focusNode,
                        style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w500),
                        decoration: InputDecoration(
                          hintText: 'Escoger o escribir...',
                          hintStyle: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 15),
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding: const EdgeInsets.symmetric(vertical: 8),
                        ),
                      );
                    },
                    optionsViewBuilder: (context, onSelected, options) {
                      return Align(
                        alignment: Alignment.topLeft,
                        child: Material(
                          color: Colors.transparent,
                          child: Container(
                            width: constraints.maxWidth,
                            margin: const EdgeInsets.only(top: 4),
                            decoration: BoxDecoration(
                              color: _cardBg,
                              borderRadius: BorderRadius.circular(15),
                              border: Border.all(color: _limeNeon.withOpacity(0.3)),
                              boxShadow: [
                                BoxShadow(color: Colors.black.withOpacity(0.5), blurRadius: 10)
                              ]
                            ),
                            child: ListView.builder(
                              padding: EdgeInsets.zero,
                              shrinkWrap: true,
                              itemCount: options.length,
                              itemBuilder: (BuildContext context, int index) {
                                final String option = options.elementAt(index);
                                return ListTile(
                                  title: Text(option, style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 14)),
                                  onTap: () => onSelected(option),
                                  dense: true,
                                );
                              },
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        );
      }
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
            style: GoogleFonts.orbitron(
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

  Future<void> _pickImage() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 70,
      );
      
      if (image != null) {
        final bytes = await image.readAsBytes();
        setState(() {
          _isLoading = true;
          _imageBytes = bytes;
        });

        final String fileName = '${DateTime.now().millisecondsSinceEpoch}.jpg';
        final String? url = await _productService.uploadImage(bytes, fileName);
        
        setState(() {
          _imageUrl = url;
          _isLoading = false;
        });

        if (url != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Imagen subida correctamente')),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Error al subir la imagen')),
          );
        }
      }
    } catch (e) {
      print('Error picking image: $e');
      setState(() => _isLoading = false);
    }
  }

  Widget _buildImageUpload() {
    return Center(
      child: Stack(
        alignment: Alignment.center,
        clipBehavior: Clip.none,
        children: [
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
          SizedBox(
            width: 140,
            height: 140,
            child: CustomPaint(
              painter: DashedCirclePainter(color: _cyanNeon),
            ),
          ),
          ClipOval(
            child: SizedBox(
              width: 130,
              height: 130,
              child: _imageBytes != null 
                ? Image.memory(_imageBytes!, fit: BoxFit.cover)
                : Column(
                    mainAxisAlignment: MainAxisAlignment.center,
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
            ),
          ),
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

  Widget _buildInputField(String label, String hint, TextEditingController controller, FocusNode focusNode, {IconData? trailingIcon, bool isNumeric = false}) {
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
                  controller: controller,
                  focusNode: focusNode,
                  keyboardType: isNumeric ? const TextInputType.numberWithOptions(decimal: true) : TextInputType.text,
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
      onTap: _isLoading ? null : _saveProduct,
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
              const Icon(Icons.add_circle, color: Colors.black, size: 28),
            const SizedBox(width: 12),
            Text(
              _isLoading ? 'GUARDANDO...' : 'GUARDAR PRODUCTO',
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
