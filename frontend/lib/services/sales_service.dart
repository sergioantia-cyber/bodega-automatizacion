import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/sale.dart';

class SalesService {
  final _supabase = Supabase.instance.client;

  // READ - Get all sales
  Future<List<Sale>> getAllSales() async {
    try {
      final response = await _supabase
          .from('ventas')
          .select('*, items:ventas_items(*)')
          .order('fecha', ascending: false);
      
      return (response as List).map((json) {
        final sale = Sale.fromJson(json);
        final itemsList = (json['items'] as List?)
            ?.map((i) => SaleItem.fromJson(i))
            .toList();
        return Sale(
          id: sale.id,
          orderNumber: sale.orderNumber,
          date: sale.date,
          subtotal: sale.subtotal,
          tax: sale.tax,
          total: sale.total,
          paymentMethod: sale.paymentMethod,
          status: sale.status,
          clientId: sale.clientId,
          cashSessionId: sale.cashSessionId,
          notes: sale.notes,
          items: itemsList,
        );
      }).toList();
    } catch (e) {
      print('Error fetching sales: $e');
      rethrow;
    }
  }

  // CREATE - Create new sale (Atómico vía RPC)
  Future<void> createSale(Sale sale, List<SaleItem> items) async {
    try {
      // Usar la función RPC para garantizar atomicidad e integridad
      await _supabase.rpc(
        'process_sale_atomic',
        params: {
          'p_client_id': sale.clientId,
          'p_subtotal': sale.subtotal,
          'p_tax': sale.tax,
          'p_total': sale.total,
          'p_payment_method': sale.paymentMethod,
          'p_notes': sale.notes,
          'p_items': items.map((i) => {
            'productId': i.productId,
            'productName': i.productName,
            'quantity': i.quantity,
            'unitPrice': i.unitPrice,
            'subtotal': i.subtotal,
          }).toList(),
        },
      );
    } catch (e) {
      print('Error creating sale via RPC: $e');
      rethrow;
    }
  }
}
