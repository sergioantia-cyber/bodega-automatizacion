class Expense {
  final String? id;
  final String type;
  final String? description;
  final double amount;
  final String paymentMethod;
  final String? cashSessionId;
  final DateTime? date;

  Expense({
    this.id,
    required this.type,
    this.description,
    required this.amount,
    this.paymentMethod = 'Efectivo',
    this.cashSessionId,
    this.date,
  });

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'tipo': type,
      'descripcion': description,
      'monto': amount,
      'metodo_pago': paymentMethod,
      'id_sesion_caja': cashSessionId,
    };
  }

  factory Expense.fromJson(Map<String, dynamic> json) {
    return Expense(
      id: json['id'],
      type: json['tipo'] ?? 'General',
      description: json['descripcion'],
      amount: (json['monto'] as num?)?.toDouble() ?? 0.0,
      paymentMethod: json['metodo_pago'] ?? 'Efectivo',
      cashSessionId: json['id_sesion_caja'],
      date: json['fecha'] != null ? DateTime.parse(json['fecha']) : null,
    );
  }
}
