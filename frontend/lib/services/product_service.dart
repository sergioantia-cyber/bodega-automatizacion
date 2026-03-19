import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/product.dart';

class ProductService {
  final _supabase = Supabase.instance.client;

  // READ - Get all products
  Future<List<Product>> getAllProducts() async {
    try {
      final response = await _supabase
          .from('productos')
          .select()
          .order('nombre', ascending: true);
      
      return (response as List).map((json) => Product.fromJson(json)).toList();
    } catch (e) {
      print('Error fetching products: $e');
      rethrow;
    }
  }

  // READ - Get products by category
  Future<List<Product>> getProductsByCategory(String category) async {
    try {
      final response = await _supabase
          .from('productos')
          .select()
          .eq('categoria', category)
          .order('nombre', ascending: true);
      
      return (response as List).map((json) => Product.fromJson(json)).toList();
    } catch (e) {
      print('Error fetching products by category: $e');
      rethrow;
    }
  }

  // CREATE - Add new product
  Future<Product> addProduct(Product product) async {
    try {
      final response = await _supabase
          .from('productos')
          .insert(product.toJson())
          .select()
          .single();
      
      return Product.fromJson(response);
    } catch (e) {
      print('Error adding product: $e');
      rethrow;
    }
  }

  // UPDATE - Update product data
  Future<void> updateProduct(Product product) async {
    if (product.id == null) return;
    try {
      await _supabase
          .from('productos')
          .update(product.toJson())
          .eq('id', product.id!);
    } catch (e) {
      print('Error updating product: $e');
      rethrow;
    }
  }

  // DELETE - Delete or deactivate product
  Future<void> deleteProduct(String id) async {
    try {
      // Preferring deactivation for data integrity
      await _supabase
          .from('productos')
          .update({'activo': false})
          .eq('id', id);
    } catch (e) {
      print('Error deleting product: $e');
      rethrow;
    }
  }

  // SEARCH - Search by name or barcode
  Future<List<Product>> searchProducts(String query) async {
    try {
      final response = await _supabase
          .from('productos')
          .select()
          .or('nombre.ilike.%$query%,codigo_barras.ilike.%$query%')
          .order('nombre', ascending: true);
      
      return (response as List).map((json) => Product.fromJson(json)).toList();
    } catch (e) {
      print('Error searching products: $e');
      rethrow;
    }
  }

  // UPDATE - Decrement stock
  Future<void> decrementProductStock(String productId, double quantity) async {
    try {
      final product = await _supabase
          .from('productos')
          .select('stock')
          .eq('id', productId)
          .single();
      
      double currentStock = (product['stock'] as num).toDouble();
      double newStock = currentStock - quantity;

      await _supabase
          .from('productos')
          .update({'stock': (newStock < 0) ? 0.0 : newStock})
          .eq('id', productId);
    } catch (e) {
      print('Error decrementing stock: $e');
      rethrow;
    }
  }

  // READ - Get unique categories
  Future<List<String>> getCategories() async {
    try {
      final response = await _supabase
          .from('productos')
          .select('categoria');
      
      final List<String> categories = (response as List)
          .where((json) => json['categoria'] != null)
          .map((json) => json['categoria'].toString())
          .where((cat) => cat.trim().isNotEmpty)
          .toSet()
          .toList();
      
      categories.sort();
      return categories;
    } catch (e) {
      print('Error fetching categories: $e');
      return [];
    }
  }
}
