import 'dart:typed_data';
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
          .eq('negocio', 'MINIMARKET')
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
          .eq('negocio', 'MINIMARKET')
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
      final data = product.toJson();
      data['negocio'] = 'MINIMARKET'; // Asegurar que se guarde en el inventario correcto
      
      final response = await _supabase
          .from('productos')
          .insert(data)
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
          .eq('negocio', 'MINIMARKET')
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
          .select('stock_actual')
          .eq('id', productId)
          .eq('negocio', 'MINIMARKET')
          .single();
      
      double currentStock = (product['stock_actual'] as num).toDouble();
      double newStock = currentStock - quantity;

      await _supabase
          .from('productos')
          .update({'stock_actual': (newStock < 0) ? 0.0 : newStock})
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

  // READ - Get specific product by barcode
  Future<Product?> getProductByBarcode(String barcode) async {
    try {
      final response = await _supabase
          .from('productos')
          .select()
          .eq('codigo_barras', barcode)
          .eq('negocio', 'MINIMARKET')
          .maybeSingle();
      
      if (response == null) return null;
      return Product.fromJson(response);
    } catch (e) {
      print('Error fetching product by barcode: $e');
      return null;
    }
  }

  // UPLOAD - Upload image to Supabase Storage
  Future<String?> uploadImage(Uint8List fileBytes, String fileName) async {
    try {
      final String path = 'minimarket/$fileName';
      await _supabase.storage.from('productos').uploadBinary(
        path,
        fileBytes,
        fileOptions: const FileOptions(cacheControl: '3600', upsert: true),
      );
      
      final String publicUrl = _supabase.storage.from('productos').getPublicUrl(path);
      return publicUrl;
    } catch (e) {
      print('Error uploading image: $e');
      return null;
    }
  }
}
