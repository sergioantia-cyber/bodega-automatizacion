import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../components/glass_card.dart';
import '../../models/client.dart';
import '../../services/client_service.dart';
import 'package:url_launcher/url_launcher.dart';

class ClientsDirectoryTab extends StatefulWidget {
  final Function(Client) onClientSelected;
  final VoidCallback onAddRequested;

  const ClientsDirectoryTab({
    super.key,
    required this.onClientSelected,
    required this.onAddRequested,
  });

  @override
  State<ClientsDirectoryTab> createState() => _ClientsDirectoryTabState();
}

class _ClientsDirectoryTabState extends State<ClientsDirectoryTab> {
  final ClientService _clientService = ClientService();
  final Color _magentaNeon = const Color(0xFFFF00FF);
  final Color _cyanNeon = const Color(0xFF00FBFF);
  final Color _limeNeon = const Color(0xFF8CFF00);

  List<Client> _clients = [];
  bool _isLoading = true;
  double _totalDebt = 0.0;
  int _totalPoints = 0;
  String _filterType = 'ALL';

  @override
  void initState() {
    super.initState();
    _loadClients();
  }

  Future<void> _loadClients() async {
    setState(() => _isLoading = true);
    try {
      final clients = await _clientService.getClients();
      if (mounted) {
        setState(() {
          _clients = clients;
          _totalDebt = clients.fold(0.0, (sum, c) => sum + c.debt);
          _totalPoints = clients.fold(0, (sum, c) => sum + c.points);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        print('Error loading clients: $e');
      }
    }
  }

  Future<void> _searchClients(String query) async {
    if (query.isEmpty) {
      _loadClients();
      return;
    }
    try {
      final results = await _clientService.searchClients(query);
      if (mounted) {
        setState(() => _clients = results);
      }
    } catch (e) {
      print('Error searching clients: $e');
    }
  }

  Future<void> _launchWhatsApp(String? phone, String name) async {
    if (phone == null || phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Este cliente no tiene teléfono registrado')),
      );
      return;
    }
    
    // Clean up phone number
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    final url = 'https://wa.me/$cleanPhone?text=Hola%20$name,%20te%20escribimos%20de%20POS%20Ureña...';
    
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No se pudo abrir WhatsApp')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent, // Background handled by parent
      body: RefreshIndicator(
        onRefresh: _loadClients,
        color: _magentaNeon,
        child: Column(
          children: [
            _buildCrmSummary(),
            _buildSearchBox(),
            _buildFilters(),
            Expanded(
              child: _isLoading 
                ? const Center(child: CircularProgressIndicator()) 
                : _buildClientsList(),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: widget.onAddRequested,
        backgroundColor: Colors.redAccent, // Botón Flotante Rojo (+)
        child: const Icon(Icons.add, color: Colors.white, size: 30),
      ),
    );
  }

  Widget _buildCrmSummary() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: GlassCard(
        padding: const EdgeInsets.all(20),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildStatItem('TOTAL CLIENTES', _clients.length.toString(), _cyanNeon),
            _buildStatItem('POR COBRAR', '\$${(_totalDebt / 1000).toStringAsFixed(1)}K', _magentaNeon),
            _buildStatItem('PUNTOS', '${(_totalPoints / 1000).toStringAsFixed(1)}K', _limeNeon),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(label, style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
        Text(value, style: GoogleFonts.orbitron(color: color, fontSize: 18, fontWeight: FontWeight.w900)),
      ],
    );
  }

  Widget _buildSearchBox() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      child: TextField(
        style: const TextStyle(color: Colors.white),
        onChanged: _searchClients,
        decoration: InputDecoration(
          hintText: 'Buscar cliente por nombre o cédula...',
          hintStyle: const TextStyle(color: Colors.white10),
          prefixIcon: Icon(Icons.search_rounded, color: _cyanNeon),
          filled: true,
          fillColor: Colors.white.withOpacity(0.02),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide.none),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide(color: Colors.white.withOpacity(0.05))),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide(color: _cyanNeon.withOpacity(0.5))),
        ),
      ),
    );
  }

  Widget _buildFilters() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          _buildFilterChip('ALL', 'TODOS', Colors.white),
          const SizedBox(width: 8),
          _buildFilterChip('DEBTORS', 'CON DEUDA', _magentaNeon),
          const SizedBox(width: 8),
          _buildFilterChip('PAID', 'SSOLVENTES', _limeNeon),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String type, String label, Color color) {
    bool isSelected = _filterType == type;
    return GestureDetector(
      onTap: () => setState(() => _filterType = type),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.2) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? color : Colors.white24),
        ),
        child: Text(
          label,
          style: GoogleFonts.spaceGrotesk(
            color: isSelected ? color : Colors.white54,
            fontSize: 10,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildClientsList() {
    List<Client> filteredList = _clients.where((c) {
      if (_filterType == 'DEBTORS') return c.debt > 0;
      if (_filterType == 'PAID') return c.debt == 0;
      return true;
    }).toList();

    if (filteredList.isEmpty) {
      return Center(child: Text('No se encontraron clientes', style: GoogleFonts.spaceGrotesk(color: Colors.white24)));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: filteredList.length,
      itemBuilder: (context, index) {
        final client = filteredList[index];
        bool hasDebt = client.debt > 0;

        return Padding(
          padding: const EdgeInsets.only(bottom: 12.0),
          child: GestureDetector(
            onTap: () => widget.onClientSelected(client),
            child: GlassCard(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: (hasDebt ? _magentaNeon : _limeNeon).withOpacity(0.1),
                    radius: 25,
                    child: Text(client.name[0].toUpperCase(), style: GoogleFonts.orbitron(color: hasDebt ? _magentaNeon : _limeNeon, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(client.name, style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
                        Text(client.document ?? 'Sin cédula', style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 10)),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      if (hasDebt)
                        Text('\$${client.debt.toStringAsFixed(2)}', style: GoogleFonts.orbitron(color: _magentaNeon, fontSize: 14, fontWeight: FontWeight.w900))
                      else
                        Text('\$0.00', style: GoogleFonts.orbitron(color: _limeNeon, fontSize: 14, fontWeight: FontWeight.w900)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          IconButton(
                            icon: Icon(Icons.chat_bubble_outline_rounded, color: _limeNeon, size: 20),
                            onPressed: () => _launchWhatsApp(client.phone, client.name),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                          const SizedBox(width: 12),
                          Icon(Icons.arrow_forward_ios_rounded, color: Colors.white38, size: 10),
                        ],
                      )
                    ],
                  )
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

