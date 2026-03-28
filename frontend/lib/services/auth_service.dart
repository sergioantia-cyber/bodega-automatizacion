import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  final SupabaseClient _supabase = Supabase.instance.client;

  // Get current user session
  Session? get currentSession => _supabase.auth.currentSession;
  User? get currentUser => _supabase.auth.currentUser;

  // Sign in with email and password
  Future<AuthResponse> signIn(String email, String password) async {
    return await _supabase.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  // Sign out
  Future<void> signOut() async {
    await _supabase.auth.signOut();
  }

  // Check if user is Admin
  Future<bool> isAdmin() async {
    final user = currentUser;
    if (user == null) return false;

    final response = await _supabase
        .from('perfiles')
        .select('rol')
        .eq('id', user.id)
        .single();
    
    return response['rol'] == 'admin';
  }
}
