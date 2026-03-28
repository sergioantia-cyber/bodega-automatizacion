import 'package:flutter/material.dart';
import 'dart:math' as math;

class FloatingAIBubble extends StatefulWidget {
  final VoidCallback onTap;
  const FloatingAIBubble({super.key, required this.onTap});

  @override
  State<FloatingAIBubble> createState() => _FloatingAIBubbleState();
}

class _FloatingAIBubbleState extends State<FloatingAIBubble> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  final Color _magentaNeon = const Color(0xFFFF00FF);
  final Color _cyanNeon = const Color(0xFF00FBFF);

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: AnimatedBuilder(
        animation: _animController,
        builder: (context, child) {
          final pulse = math.sin(_animController.value * math.pi * 2) * 0.1 + 0.9;
          return Container(
            width: 56, height: 56,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.black.withOpacity(0.8),
              border: Border.all(color: _magentaNeon, width: 2),
              boxShadow: [
                BoxShadow(
                  color: _magentaNeon.withOpacity(0.4 * pulse),
                  blurRadius: 15 * pulse,
                  spreadRadius: 2,
                ),
                BoxShadow(
                  color: _cyanNeon.withOpacity(0.2),
                  blurRadius: 25,
                ),
              ],
            ),
            child: Icon(Icons.auto_awesome_rounded, color: _magentaNeon, size: 28),
          );
        },
      ),
    );
  }
}
