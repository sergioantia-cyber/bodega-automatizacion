class Sale {
  final String? id;
  final int? orderNumber;
  final DateTime? date;
  final double subtotal;
  final double tax;
  final double total;
  final String? paymentMethod;
  final String status;
  final String? clientId;
  final String? cashSessionId;
  final String? notes;
  final List<SaleItem>? items;

  Sale({
    this.id,
    this.orderNumber,
    this.date,
    required this.subtotal,
    this.tax = 0.0,
    required this.total,
    this.paymentMethod,
    this.status = 'completada',
    this.clientId,
    this.cashSessionId,
    this.notes,
    this.items,
  });

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'subtotal': subtotal,
      'impuesto': tax,
      'total': total,
      'metodo_pago': paymentMethod,
      'estado': status,
      'id_cliente': clientId,
      'id_sesion_caja': cashSessionId,
      'notas': notes,
    };
  }

  factory Sale.fromJson(Map<String, dynamic> json) {
    return Sale(
      id: json['id'],
      orderNumber: json['numero_venta'],
      date: json['fecha'] != null ? DateTime.parse(json['fecha']) : null,
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      tax: (json['impuesto'] as num?)?.toDouble() ?? 0.0,
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      paymentMethod: json['metodo_pago'],
      status: json['estado'] ?? 'completada',
      clientId: json['id_cliente'],
      cashSessionId: json['id_sesion_caja'],
      notes: json['notas'],
    );
  }
}

class SaleItem {
  final String? id;
  final String? saleId;
  final String? productId;
  final String? productName;
  final int quantity;
  final double unitPrice;
  final double subtotal;

  SaleItem({
    this.id,
    this.saleId,
    this.productId,
    this.productName,
    required this.quantity,
    required this.unitPrice,
    required this.subtotal,
  });

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'id_venta': saleId,
      'id_producto': productId,
      'nombre_producto': productName,
      'cantidad': quantity,
      'precio_unitario': unitPrice,
      'subtotal': subtotal,
    };
  }

  factory SaleItem.fromJson(Map<String, dynamic> json) {
    return SaleItem(
      id: json['id'],
      saleId: json['id_venta'],
      productId: json['id_producto'],
      productName: json['nombre_producto'],
      quantity: json['cantidad'] ?? 1,
      unitPrice: (json['precio_unitario'] as num?)?.toDouble() ?? 0.0,
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
