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

  // CREATE - Create new sale
  Future<void> createSale(Sale sale, List<SaleItem> items) async {
    try {
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
      print('Error creating sale: $e');
      rethrow;
    }
  }

  // READ - Get Stats for dashboard
  Future<Map<String, dynamic>> getSalesStats() async {
    try {
      final sales = await getAllSales();
      
      double totalRevenue = 0;
      int totalUnits = 0;
      Map<String, double> categorySales = {};
      Map<DateTime, double> dailyMap = {};
      
      for (var sale in sales) {
        if (sale.date == null) continue;
        totalRevenue += sale.total;
        
        DateTime day = DateTime(sale.date!.year, sale.date!.month, sale.date!.day);
        dailyMap[day] = (dailyMap[day] ?? 0) + sale.total;

        if (sale.items != null) {
          for (var item in sale.items!) {
            totalUnits += item.quantity;
          }
        }
      }

      final catResponse = await _supabase
          .from('ventas_items')
          .select('id_producto, cantidad, productos(categoria)');
      
      for (var item in (catResponse as List)) {
        final cat = item['productos']?['categoria'] ?? 'Sin Categoría';
        final qty = (item['cantidad'] as num).toDouble();
        categorySales[cat] = (categorySales[cat] ?? 0) + qty;
      }

      var sortedCats = categorySales.entries.toList()
        ..sort((a, b) => b.value.compareTo(a.value));
      
      return {
        'revenue': totalRevenue,
        'units': totalUnits,
        'dailyStats': dailyMap,
        'topCategories': sortedCats.take(3).map((e) => {'name': e.key, 'value': e.value}).toList(),
      };
    } catch (e) {
      print('Error calculating stats: $e');
      return {};
    }
  }
}
