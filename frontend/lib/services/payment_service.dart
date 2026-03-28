import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/payment_method.dart';

class PaymentService {
  final _supabase = Supabase.instance.client;

  Future<List<PaymentMethod>> getActiveMethods() async {
    try {
      final response = await _supabase
          .from('metodos_pago')
          .select('*')
          .eq('activo', true);
      
      return (response as List).map((json) => PaymentMethod.fromJson(json)).toList();
    } catch (e) {
      print('Error fetching payment methods: $e');
      return [];
    }
  }
}
