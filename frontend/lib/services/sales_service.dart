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

  // CREATE - Create new sale (including items)
  // Note: For atomic operations, an RPC call is recommended.
  // This version does sequential inserts.
  Future<void> createSale(Sale sale, List<SaleItem> items) async {
    try {
      // 1. Insert and get Sale ID
      final saleResponse = await _supabase
          .from('ventas')
          .insert(sale.toJson())
          .select()
          .single();
      
      final String saleId = saleResponse['id'];

      // 2. Prepare and Insert Items
      final itemsToInsert = items.map((item) {
        final map = item.toJson();
        map['id_venta'] = saleId;
        return map;
      }).toList();

      await _supabase.from('ventas_items').insert(itemsToInsert);

      // 3. Update stock for each product (Ideal via Trigger in DB)
      // Here we assume a trigger in Supabase handles stock deduction.
    } catch (e) {
      print('Error creating sale: $e');
      rethrow;
    }
  }
}
