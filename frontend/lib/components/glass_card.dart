import 'dart:ui';
import 'package:flutter/material.dart';

class GlassCard extends StatelessWidget {
  final Widget child;
  final double blur;
  final double opacity;
  final EdgeInsets padding;
  final VoidCallback? onTap;

  final Color? borderColor;
  final double? borderWidth;

  const GlassCard({
    super.key,
    required this.child,
    this.blur = 10,
    this.opacity = 0.1,
    this.padding = const EdgeInsets.all(16.0),
    this.onTap,
    this.borderColor,
    this.borderWidth,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16.0),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Container(
             padding: padding,
             decoration: BoxDecoration(
               color: Colors.white.withOpacity(opacity),
               borderRadius: BorderRadius.circular(16.0),
                border: Border.all(
                  color: borderColor ?? ((onTap != null) 
                    ? Theme.of(context).primaryColor.withOpacity(0.5) 
                    : Colors.white.withOpacity(0.1)),
                  width: borderWidth ?? 1.5,
                ),
               boxShadow: [
                 if (onTap != null)
                   BoxShadow(
                     color: Theme.of(context).primaryColor.withOpacity(0.2),
                     blurRadius: 15,
                     spreadRadius: 1,
                   ),
               ],
             ),
             child: child,
          ),
        ),
      ),
    );
  }
}
