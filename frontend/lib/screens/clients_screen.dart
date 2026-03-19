import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/client.dart';
import 'clients/clients_directory_tab.dart';
import 'clients/add_client_form_tab.dart';
import 'clients/client_details_tab.dart';

class ClientsScreen extends StatefulWidget {
  const ClientsScreen({super.key});

  @override
  State<ClientsScreen> createState() => _ClientsScreenState();
}

class _ClientsScreenState extends State<ClientsScreen> with SingleTickerProviderStateMixin {
  final Color _darkBg = const Color(0xFF070907);
  final Color _magentaNeon = const Color(0xFFFF00FF);
  final Color _cyanNeon = const Color(0xFF00FBFF);
  final Color _limeNeon = const Color(0xFF8CFF00);

  late TabController _tabController;
  Client? _selectedClient;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _onClientSelected(Client client) {
    setState(() => _selectedClient = client);
    _tabController.animateTo(2); // Switch to Details tab
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _darkBg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('CLIENTES Y CRÉDITO', style: GoogleFonts.orbitron(fontWeight: FontWeight.w900, fontSize: 16)),
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: _cyanNeon,
          labelColor: _cyanNeon,
          unselectedLabelColor: Colors.white54,
          labelStyle: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold, fontSize: 12),
          tabs: const [
            Tab(icon: Icon(Icons.list_alt_rounded), text: 'Directorio'),
            Tab(icon: Icon(Icons.person_add_alt_1_rounded), text: 'Añadir'),
            Tab(icon: Icon(Icons.account_balance_wallet_rounded), text: 'Detalles'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        physics: const NeverScrollableScrollPhysics(), // Only switch tabs by tapping or code
        children: [
          ClientsDirectoryTab(
            onClientSelected: _onClientSelected,
            onAddRequested: () => _tabController.animateTo(1),
          ),
          AddClientFormTab(
            onClientAdded: () {
              // Switch back to directory to show new client
              _tabController.animateTo(0);
            },
          ),
          ClientDetailsTab(
            client: _selectedClient,
            onDebtUpdated: () {
              // Optionally trigger refresh elsewhere if needed
            },
            onBackPressed: () => _tabController.animateTo(0),
          ),
        ],
      ),
    );
  }
}
