import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController(text: 'admin@posurena.com');
  final _passwordController = TextEditingController(text: 'admin123456');
  final _authService = AuthService();
  bool _isLoading = false;

  final Color _darkBg = const Color(0xFF070907);
  final Color _limeNeon = const Color(0xFF8CFF00);
  final Color _cyanNeon = const Color(0xFF00FBFF);
  final Color _magentaNeon = const Color(0xFFFF00FF);

  Future<void> _handleLogin() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      _showError('Por favor complete todos los campos');
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _authService.signIn(_emailController.text, _passwordController.text);
      if (mounted) Navigator.pushReplacementNamed(context, '/');
    } on AuthException catch (e) {
      _showError(e.message);
    } catch (e) {
      _showError('Ocurrió un error inesperado');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.redAccent,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _darkBg,
      body: Stack(
        children: [
          // Background Glows
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _cyanNeon.withOpacity(0.05),
              ),
            ),
          ),
          Positioned(
            bottom: -100,
            right: -100,
            child: Container(
              width: 400,
              height: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _magentaNeon.withOpacity(0.05),
              ),
            ),
          ),
          
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(32.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo / Icon
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: _darkBg,
                      shape: BoxShape.circle,
                      border: Border.all(color: _cyanNeon, width: 2),
                      boxShadow: [
                        BoxShadow(color: _cyanNeon.withOpacity(0.3), blurRadius: 20, spreadRadius: 2),
                      ],
                    ),
                    child: Icon(Icons.shield_outlined, color: _cyanNeon, size: 50),
                  ),
                  const SizedBox(height: 32),
                  
                  Text(
                    'POS UREÑA',
                    style: GoogleFonts.orbitron(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 4.0,
                    ),
                  ),
                  Text(
                    'SECURITY ACCESS',
                    style: GoogleFonts.spaceGrotesk(
                      color: _limeNeon,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2.0,
                    ),
                  ),
                  const SizedBox(height: 64),
                  
                  // Email Input
                  _buildTextField(
                    label: 'CORREO ELECTRÓNICO',
                    controller: _emailController,
                    icon: Icons.alternate_email,
                    color: _cyanNeon,
                  ),
                  const SizedBox(height: 24),
                  
                  // Password Input
                  _buildTextField(
                    label: 'CONTRASEÑA',
                    controller: _passwordController,
                    icon: Icons.lock_outline,
                    color: _magentaNeon,
                    isPassword: true,
                  ),
                  const SizedBox(height: 48),
                  
                  // Login Button
                  GestureDetector(
                    onTap: _isLoading ? null : _handleLogin,
                    child: Container(
                      width: double.infinity,
                      height: 64,
                      decoration: BoxDecoration(
                        color: _limeNeon,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: _limeNeon.withOpacity(0.3),
                            blurRadius: 20,
                            spreadRadius: 2,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Center(
                        child: _isLoading
                            ? const CircularProgressIndicator(color: Colors.black)
                            : Text(
                                'ACCEDER AL SISTEMA',
                                style: GoogleFonts.spaceGrotesk(
                                  color: Colors.black,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 16,
                                  letterSpacing: 1.5,
                                ),
                              ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Olvidaste tu contraseña?',
                    style: GoogleFonts.spaceGrotesk(color: Colors.white38, fontSize: 12),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    required IconData icon,
    required Color color,
    bool isPassword = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.spaceGrotesk(
            color: color.withOpacity(0.7),
            fontSize: 10,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          height: 60,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.03),
            borderRadius: BorderRadius.circular(15),
            border: Border.all(color: Colors.white.withOpacity(0.05)),
          ),
          child: TextField(
            controller: controller,
            obscureText: isPassword,
            style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 16),
            decoration: InputDecoration(
              prefixIcon: Icon(icon, color: color.withOpacity(0.5), size: 20),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 18),
            ),
          ),
        ),
      ],
    );
  }
}
