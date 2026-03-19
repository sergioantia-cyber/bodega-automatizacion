class Client {
  final String? id;
  final String name;
  final String? document; // cedula
  final String? phone;
  final String? email;
  final String? address;
  double debt;
  int points;
  final String? notes;
  final bool active;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Client({
    this.id,
    required this.name,
    this.document,
    this.phone,
    this.email,
    this.address,
    this.debt = 0,
    this.points = 0,
    this.notes,
    this.active = true,
    this.createdAt,
    this.updatedAt,
  });

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'nombre': name,
      'cedula': document,
      'telefono': phone,
      'email': email,
      'direccion': address,
      'deuda': debt,
      'puntos': points,
      'notas': notes,
      'activo': active,
    };
  }

  factory Client.fromJson(Map<String, dynamic> json) {
    return Client(
      id: json['id'],
      name: json['nombre'] ?? '',
      document: json['cedula'],
      phone: json['telefono'],
      email: json['email'],
      address: json['direccion'],
      debt: (json['deuda'] as num?)?.toDouble() ?? 0.0,
      points: json['puntos'] ?? 0,
      notes: json['notas'],
      active: json['activo'] ?? true,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : null,
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at']) : null,
    );
  }
}
