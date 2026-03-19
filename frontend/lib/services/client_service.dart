import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/client.dart';

class ClientService {
  final _supabase = Supabase.instance.client;

  Future<List<Client>> getClients() async {
    final response = await _supabase
        .from('clientes')
        .select()
        .eq('activo', true)
        .order('nombre', ascending: true);
    
    return (response as List).map((json) => Client.fromJson(json)).toList();
  }

  Future<Client> addClient(Client client) async {
    final response = await _supabase
        .from('clientes')
        .insert(client.toJson())
        .select()
        .single();
    
    return Client.fromJson(response);
  }

  Future<Client> updateClient(Client client) async {
    final response = await _supabase
        .from('clientes')
        .update(client.toJson())
        .eq('id', client.id!)
        .select()
        .single();
    
    return Client.fromJson(response);
  }

  Future<void> deleteClient(String id) async {
    await _supabase
        .from('clientes')
        .update({'activo': false})
        .eq('id', id);
  }

  Future<List<Client>> searchClients(String query) async {
    final response = await _supabase
        .from('clientes')
        .select()
        .or('nombre.ilike.%$query%,cedula.ilike.%$query%')
        .eq('activo', true);
    
    return (response as List).map((json) => Client.fromJson(json)).toList();
  }
}
