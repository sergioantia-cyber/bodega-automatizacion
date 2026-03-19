import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../components/glass_card.dart';

class UserProfileScreen extends StatelessWidget {
  const UserProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    const limeNeon = Color(0xFF8CFF00);
    const cyanNeon = Color(0xFF00FBFF);
    const redNeon = Color(0xFFFF2D55);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            children: [
              _buildProfileHeader(limeNeon, cyanNeon),
              const SizedBox(height: 48),
              _buildSectionTitle('SISTEMA'),
              const SizedBox(height: 16),
              _buildOptionCard(
                context, 
                'CIERRE DE TURNO', 
                'Reporte final y arqueo de caja', 
                Icons.lock_clock_rounded, 
                limeNeon, 
                () => Navigator.pushNamed(context, '/cash_management')
              ),
              const SizedBox(height: 12),
              _buildOptionCard(
                context, 
                'CONFIGURACIÓN', 
                'Ajustes del sistema y periféricos', 
                Icons.settings_rounded, 
                cyanNeon, 
                () {}
              ),
              const SizedBox(height: 32),
              _buildSectionTitle('GESTIÓN EMPRESARIAL'),
              const SizedBox(height: 16),
              _buildOptionCard(
                context, 
                'PROVEEDORES', 
                'Gestión de compras y proveedores', 
                Icons.business_rounded, 
                const Color(0xFFFF9100), 
                () => Navigator.pushNamed(context, '/suppliers')
              ),
              const SizedBox(height: 12),
              _buildOptionCard(
                context, 
                'CLIENTES Y CRÉDITO', 
                'Gestión de fidelización y fiaos', 
                Icons.person_pin_rounded, 
                const Color(0xFFFF00FF), 
                () => Navigator.pushNamed(context, '/clients')
              ),
              const SizedBox(height: 48),
              _buildLogoutButton(redNeon),
              const SizedBox(height: 120), // Bottom nav padding
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        title,
        style: GoogleFonts.orbitron(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2.0),
      ),
    );
  }

  Widget _buildProfileHeader(Color lime, Color cyan) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.bottomRight,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: cyan.withOpacity(0.5), width: 2),
                boxShadow: [BoxShadow(color: cyan.withOpacity(0.1), blurRadius: 40)],
              ),
              child: Padding(
                padding: const EdgeInsets.all(4),
                child: Container(
                  decoration: const BoxDecoration(
                    color: Color(0xFF141714),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.person_rounded, size: 60, color: lime.withOpacity(0.8)),
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: cyan,
                shape: BoxShape.circle,
                boxShadow: [BoxShadow(color: cyan.withOpacity(0.5), blurRadius: 10)],
              ),
              child: const Icon(Icons.edit_rounded, size: 16, color: Colors.black),
            ),
          ],
        ),
        const SizedBox(height: 24),
        Text(
          'ADMIN POS UREÑA', 
          style: GoogleFonts.orbitron(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 1.0)
        ),
        const SizedBox(height: 4),
        Text(
          'ID: #142857', 
          style: GoogleFonts.spaceGrotesk(color: cyan, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2.0)
        ),
      ],
    );
  }

  Widget _buildOptionCard(BuildContext context, String title, String sub, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: GlassCard(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1), 
                borderRadius: BorderRadius.circular(15),
                border: Border.all(color: color.withOpacity(0.2)),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title, 
                    style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w900, fontSize: 14, color: Colors.white, letterSpacing: 1.0)
                  ),
                  const SizedBox(height: 2),
                  Text(
                    sub, 
                    style: GoogleFonts.spaceGrotesk(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold)
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Colors.white.withOpacity(0.1)),
          ],
        ),
      ),
    );
  }

  Widget _buildLogoutButton(Color color) {
    return GestureDetector(
      onTap: () {},
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.05),
          borderRadius: BorderRadius.circular(30),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.logout_rounded, color: color, size: 20),
            const SizedBox(width: 12),
            Text(
              'CERRAR SESIÓN', 
              style: GoogleFonts.orbitron(color: color, fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1.5)
            ),
          ],
        ),
      ),
    );
  }
}
