import 'package:flutter/material.dart';

class Product {
  final String? id;
  final String? barcode;
  final String name;
  final String? description;
  final String category;
  final double price;
  final double cost;
  final int stock;
  final int maxStock;
  final int minAlert;
  final String abcCategory;
  final String? imageUrl;
  final bool active;
  final String negocio;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Product({
    this.id,
    this.barcode,
    required this.name,
    this.description,
    this.category = 'General',
    required this.price,
    this.cost = 0,
    this.stock = 0,
    this.maxStock = 100,
    this.minAlert = 5,
    this.abcCategory = 'C',
    this.imageUrl,
    this.active = true,
    this.negocio = 'MINIMARKET',
    this.createdAt,
    this.updatedAt,
  });

  // Convert to Map for Supabase (Snake Case)
  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'codigo_barras': barcode,
      'nombre': name,
      'descripcion': description,
      'categoria': category,
      'precio_venta': price,
      'costo_compra': cost,
      'stock_actual': stock,
      'stock_maximo': maxStock,
      'alerta_minima': minAlert,
      'categoria_abc': abcCategory,
      'imagen_url': imageUrl,
      'activo': active,
      'negocio': negocio,
    };
  }

  // Create from Supabase Map
  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      barcode: json['codigo_barras'],
      name: json['nombre'] ?? '',
      description: json['descripcion'],
      category: json['categoria'] ?? 'General',
      price: (json['precio_venta'] as num?)?.toDouble() ?? 0.0,
      cost: (json['costo_compra'] as num?)?.toDouble() ?? 0.0,
      stock: (json['stock_actual'] as num?)?.toInt() ?? 0,
      maxStock: (json['stock_maximo'] as num?)?.toInt() ?? 100,
      minAlert: (json['alerta_minima'] as num?)?.toInt() ?? 5,
      abcCategory: json['categoria_abc'] ?? 'C',
      imageUrl: json['imagen_url'],
      active: json['activo'] ?? true,
      negocio: json['negocio'] ?? 'MINIMARKET',
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : null,
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at']) : null,
    );
  }

  // Get status text and color based on stock level
  String get stockStatus {
    if (stock <= minAlert) return 'CRITICAL STOCK';
    if (stock <= (maxStock * 0.4)) return 'WARNING LEVEL';
    return 'HEALTHY STOCK';
  }

  Color get statusColor {
    if (stock <= minAlert) return const Color(0xFFFF00FF); // Neon Magenta
    if (stock <= (maxStock * 0.4)) return Colors.amber;
    return const Color(0xFF8CFF00); // Neon Lime
  }
}
