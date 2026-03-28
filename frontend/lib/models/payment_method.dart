class PaymentMethod {
  final String id;
  final String bank;
  final String holder;
  final String qrUrl;
  final bool active;

  PaymentMethod({
    required this.id,
    required this.bank,
    required this.holder,
    required this.qrUrl,
    required this.active,
  });

  factory PaymentMethod.fromJson(Map<String, dynamic> json) {
    return PaymentMethod(
      id: json['id'].toString(),
      bank: json['banco'] ?? '',
      holder: json['titular'] ?? '',
      qrUrl: json['qr_url'] ?? '',
      active: json['activo'] ?? true,
    );
  }
}
