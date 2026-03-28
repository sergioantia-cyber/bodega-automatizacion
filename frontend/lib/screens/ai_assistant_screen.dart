import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../components/glass_card.dart';

import 'package:google_generative_ai/google_generative_ai.dart';

class AIAssistantScreen extends StatefulWidget {
  const AIAssistantScreen({super.key});

  @override
  State<AIAssistantScreen> createState() => _AIAssistantScreenState();
}

class _AIAssistantScreenState extends State<AIAssistantScreen> {
  final TextEditingController _messageController = TextEditingController();
  final List<Map<String, dynamic>> _chatHistory = [];
  bool _isTyping = false;
  
  // Reemplazar con tu propia API Key de Google AI Studio
  static const String _apiKey = 'YOUR_GEMINI_API_KEY';
  
  late final GenerativeModel _model;
  
  @override
  void initState() {
    super.initState();
    _model = GenerativeModel(model: 'gemini-1.5-flash', apiKey: _apiKey);
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _chatHistory.add({'isUser': true, 'message': text});
      _messageController.clear();
      _isTyping = true;
    });

    try {
      if (_apiKey == 'YOUR_GEMINI_API_KEY') {
        // Respuesta mock si no hay API Key
        await Future.delayed(const Duration(seconds: 1));
        _addBotMessage('¡Hola! Soy el asistente de Bodega Ureña. Para darte respuestas reales, configura tu API Key de Gemini en el código.');
      } else {
        final content = [Content.text("Eres un asistente experto para la app 'Bodega Ureña', un sistema POS con estética Cyberpunk. "
            "Ayuda al usuario con: $text. Explica procesos como: escaneo de productos, gestión de proveedores, "
            "revisión de estadísticas y cierre de turno. Sé breve y profesional.")];
        final response = await _model.generateContent(content);
        _addBotMessage(response.text ?? 'Lo siento, no pude procesar eso.');
      }
    } catch (e) {
      _addBotMessage('Error de conexión: Verifica tu API Key.');
    } finally {
      setState(() => _isTyping = false);
    }
  }

  void _addBotMessage(String text) {
    setState(() {
      _chatHistory.add({'isUser': false, 'message': text});
    });
  }
  final Color _darkBg = const Color(0xFF070907);
  final Color _limeNeon = const Color(0xFF8CFF00);
  final Color _cyanNeon = const Color(0xFF00FBFF);
  final Color _magentaNeon = const Color(0xFFFF00FF);
  
  final List<Map<String, String>> _categories = [
    {
      'title': 'GESTIÓN DE INVENTARIO',
      'icon': 'inventory_2_rounded',
      'desc': 'Para añadir productos, ve a Stock > (+) neón. Escanea el código o ingresa manual.',
      'color': '0xFF00FBFF'
    },
    {
      'title': 'VENTAS Y POS',
      'icon': 'shopping_cart_rounded',
      'desc': 'Usa el botón central > VENDER. Escanea productos y selecciona método de pago.',
      'color': '0xFF8CFF00'
    },
    {
      'title': 'ESTADÍSTICAS',
      'icon': 'bar_chart_rounded',
      'desc': 'En la pestaña STATS verás gráficas de ventas diarias y productos más vendidos.',
      'color': '0xFFFF2D55'
    },
  ];

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
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildHeroSection(),
                    const SizedBox(height: 32),
                    if (_chatHistory.isNotEmpty) ...[
                      Text(
                        'CONVERSACIÓN EN VIVO',
                        style: GoogleFonts.orbitron(
                          color: _magentaNeon,
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.0,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ..._chatHistory.map((chat) => _buildChatBubble(chat)).toList(),
                      if (_isTyping) 
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Text('AI procesando...', style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 10)),
                        ),
                      const SizedBox(height: 32),
                    ],
                    Text(
                      'GUÍAS DE OPERACIÓN',
                      style: GoogleFonts.orbitron(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2.0,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ..._categories.map((cat) => _buildGuideCard(cat)).toList(),
                    const SizedBox(height: 100), // Space for bottom
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: _buildChatInput(),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              IconButton(
                icon: Icon(Icons.close_rounded, color: _limeNeon),
                onPressed: () => Navigator.pop(context),
              ),
              const SizedBox(width: 8),
              Text(
                'AI ASSISTANT',
                style: GoogleFonts.orbitron(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.5,
                ),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: _cyanNeon.withOpacity(0.1),
              borderRadius: BorderRadius.circular(15),
              border: Border.all(color: _cyanNeon.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                Container(
                  width: 8, height: 8,
                  decoration: BoxDecoration(color: _cyanNeon, shape: BoxShape.circle),
                ),
                const SizedBox(width: 8),
                Text('LIVE', style: GoogleFonts.spaceGrotesk(color: _cyanNeon, fontWeight: FontWeight.bold, fontSize: 10)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroSection() {
    return GlassCard(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.auto_awesome_rounded, color: _magentaNeon, size: 40),
          const SizedBox(height: 16),
          Text(
            '¡Hola, Administrador!',
            style: GoogleFonts.spaceGrotesk(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Soy tu asistente de soporte en tiempo real. ¿En qué sección necesitas ayuda hoy?',
            style: GoogleFonts.spaceGrotesk(color: Colors.white54, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildGuideCard(Map<String, String> cat) {
    final color = Color(int.parse(cat['color']!));
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: GlassCard(
        padding: const EdgeInsets.all(20),
        borderColor: color.withOpacity(0.2),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(_getIcon(cat['icon']!), color: color, size: 24),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    cat['title']!,
                    style: GoogleFonts.orbitron(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    cat['desc']!,
                    style: GoogleFonts.spaceGrotesk(color: Colors.white38, fontSize: 11),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChatBubble(Map<String, dynamic> chat) {
    bool isUser = chat['isUser'];
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isUser ? _magentaNeon.withOpacity(0.1) : Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: isUser ? _magentaNeon.withOpacity(0.3) : Colors.white10),
        ),
        child: Text(
          chat['message'],
          style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 13),
        ),
      ),
    );
  }

  Widget _buildChatInput() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFF141714).withOpacity(0.95),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: _limeNeon.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.5), blurRadius: 20),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _messageController,
              onSubmitted: (_) => _sendMessage(),
              style: GoogleFonts.spaceGrotesk(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Pregúntame lo que necesites...',
                hintStyle: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 13),
                border: InputBorder.none,
              ),
            ),
          ),
          IconButton(
            icon: Icon(Icons.send_rounded, color: _limeNeon, size: 24),
            onPressed: _sendMessage,
          ),
        ],
      ),
    );
  }

  IconData _getIcon(String iconName) {
    switch (iconName) {
      case 'inventory_2_rounded': return Icons.inventory_2_rounded;
      case 'shopping_cart_rounded': return Icons.shopping_cart_rounded;
      case 'bar_chart_rounded': return Icons.bar_chart_rounded;
      default: return Icons.help_outline_rounded;
    }
  }
}
