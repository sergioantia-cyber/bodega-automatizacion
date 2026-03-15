import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

class ExpenseHistoryScreen extends StatefulWidget {
  const ExpenseHistoryScreen({super.key});

  @override
  State<ExpenseHistoryScreen> createState() => _ExpenseHistoryScreenState();
}

class _ExpenseHistoryScreenState extends State<ExpenseHistoryScreen> {
  final Color _darkBg = const Color(0xFF070907);
  final Color _limeNeon = const Color(0xFF8CFF00);
  final Color _cyanNeon = const Color(0xFF00FBFF);
  
  int _selectedTab = 0; // 0 for Merchandise, 1 for General Expenses
  String _searchQuery = '';
  int? _expandedIndex;

  final List<Map<String, dynamic>> _transactions = [
    {
      'id': 'TX001',
      'title': 'CUERO PREMIUM SUPPLY',
      'date': '24 OCT, 2023',
      'category': 'INVENTARIO',
      'amount': 1240.00,
      'status': 'PAGADO',
      'icon': Icons.inventory_2_rounded,
      'type': 0,
    },
    {
      'id': 'TX002',
      'title': 'ELECTRICIDAD Y RED',
      'date': '22 OCT, 2023',
      'category': 'SERVICIOS',
      'amount': 450.20,
      'status': 'AUTO',
      'icon': Icons.bolt_rounded,
      'type': 1,
    },
    {
      'id': 'TX003',
      'title': 'MATERIALES EMPAQUE',
      'date': '20 OCT, 2023',
      'category': 'SUMINISTROS',
      'amount': 890.00,
      'status': 'PAGADO',
      'icon': Icons.card_giftcard_rounded,
      'type': 0,
    },
    {
      'id': 'TX004',
      'title': 'RENTA PLAZA CENTRAL',
      'date': '15 OCT, 2023',
      'category': 'INSTALACIONES',
      'amount': 2500.00,
      'status': 'PENDIENTE',
      'icon': Icons.apartment_rounded,
      'type': 1,
    },
    {
      'id': 'TX005',
      'title': 'LOGÍSTICA - LOTE A2',
      'date': '12 OCT, 2023',
      'category': 'ENVÍOS',
      'amount': 620.00,
      'status': 'PAGADO',
      'icon': Icons.local_shipping_rounded,
      'type': 1,
    },
  ];

  List<Map<String, dynamic>> get _filteredTransactions {
    return _transactions.where((tx) {
      bool matchesTab = tx['type'] == _selectedTab;
      bool matchesSearch = tx['title'].toString().toLowerCase().contains(_searchQuery.toLowerCase()) || 
                           tx['category'].toString().toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    }).toList();
  }

  double get _currentTotal {
    return _filteredTransactions.fold(0.0, (sum, tx) => sum + (tx['amount'] as double));
  }

  Color get _activeNeon => _selectedTab == 0 ? _limeNeon : _cyanNeon;

  final NumberFormat _currencyFormat = NumberFormat.currency(symbol: '\$', decimalDigits: 2);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _darkBg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        title: Text('HISTORIAL DE GASTOS', style: GoogleFonts.orbitron(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 2.0)),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: _activeNeon, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 12),
                    _buildSearchBar(),
                    const SizedBox(height: 32),
                    _buildTabs(),
                    const SizedBox(height: 32),
                    _buildTotalCard(),
                    const SizedBox(height: 48),
                    _buildSectionTitle('TRANSACCIONES RECIENTES'),
                    const SizedBox(height: 24),
                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 400),
                      child: Column(
                        key: ValueKey('$_selectedTab-$_searchQuery'),
                        children: _filteredTransactions.asMap().entries.map((entry) {
                          return _buildTransactionCard(entry.value, entry.key);
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 100),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.orbitron(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2.0),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: TextField(
        style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold),
        onChanged: (val) => setState(() => _searchQuery = val),
        decoration: InputDecoration(
          hintText: "Buscar por nombre o categoría...",
          hintStyle: GoogleFonts.spaceGrotesk(color: Colors.white12),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.all(20),
          prefixIcon: Icon(Icons.search_rounded, color: _activeNeon, size: 20),
        ),
      ),
    );
  }

  Widget _buildTabs() {
    return Container(
      height: 60,
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Expanded(child: _buildTabItem('MERCANCÍA', 0)),
          Expanded(child: _buildTabItem('GASTOS GRALES', 1)),
        ],
      ),
    );
  }

  Widget _buildTabItem(String title, int index) {
    bool isSelected = _selectedTab == index;
    Color color = index == 0 ? _limeNeon : _cyanNeon;
    
    return GestureDetector(
      onTap: () => setState(() => _selectedTab = index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isSelected ? color : Colors.transparent,
          borderRadius: BorderRadius.circular(15),
          boxShadow: [if (isSelected) BoxShadow(color: color.withOpacity(0.3), blurRadius: 15)],
        ),
        child: Text(
          title,
          style: GoogleFonts.orbitron(
            color: isSelected ? Colors.black : Colors.white24,
            fontWeight: FontWeight.w900,
            fontSize: 10,
            letterSpacing: 1.0,
          ),
        ),
      ),
    );
  }

  Widget _buildTotalCard() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: _activeNeon.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _activeNeon.withOpacity(0.2)),
        boxShadow: [BoxShadow(color: _activeNeon.withOpacity(0.05), blurRadius: 40)]
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'TOTAL EGRESOS DEL PERIODO',
            style: GoogleFonts.orbitron(color: _activeNeon.withOpacity(0.5), fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 2.0),
          ),
          const SizedBox(height: 12),
          Text(
            _currencyFormat.format(_currentTotal),
            style: GoogleFonts.orbitron(
              color: _activeNeon,
              fontSize: 32,
              fontWeight: FontWeight.w900,
              shadows: [BoxShadow(color: _activeNeon.withOpacity(0.3), blurRadius: 20)]
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Icon(Icons.query_stats_rounded, color: _activeNeon.withOpacity(0.5), size: 14),
              const SizedBox(width: 8),
              Text('${_filteredTransactions.length} TRANSACCIONES', style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.0)),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildTransactionCard(Map<String, dynamic> tx, int index) {
    bool isExpanded = _expandedIndex == index;
    Color color = _activeNeon;

    return GestureDetector(
      onTap: () => setState(() => _expandedIndex = isExpanded ? null : index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isExpanded ? color.withOpacity(0.08) : Colors.white.withOpacity(0.02),
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: isExpanded ? color.withOpacity(0.4) : Colors.white.withOpacity(0.05)),
          boxShadow: [if (isExpanded) BoxShadow(color: color.withOpacity(0.05), blurRadius: 15)],
        ),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: color.withOpacity(0.2)),
                  ),
                  child: Icon(tx['icon'], color: color, size: 24),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        tx['title'],
                        style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 0.5),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${tx['date']} • ${tx['category']}',
                        style: GoogleFonts.spaceGrotesk(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '-${_currencyFormat.format(tx['amount'])}',
                  style: GoogleFonts.orbitron(
                    color: color, 
                    fontWeight: FontWeight.w900, 
                    fontSize: 14,
                  ),
                ),
              ],
            ),
            if (isExpanded) ...[
              const SizedBox(height: 20),
              const Divider(color: Colors.white10),
              const SizedBox(height: 20),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 80,
                    height: 100,
                    decoration: BoxDecoration(
                      color: Colors.black38,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.white.withOpacity(0.05)),
                    ),
                    child: const Icon(Icons.receipt_long_rounded, color: Colors.white12, size: 30),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildDetailRow('REF ID', tx['id'], color),
                        const SizedBox(height: 12),
                        _buildDetailRow('ESTADO', tx['status'], color),
                        const SizedBox(height: 12),
                        _buildDetailRow('AUTH', 'ADMIN_USR', color),
                      ],
                    ),
                  )
                ],
              )
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.orbitron(color: Colors.white24, fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 1.0)),
        const SizedBox(height: 2),
        Text(value, style: GoogleFonts.spaceGrotesk(color: color, fontSize: 11, fontWeight: FontWeight.w900)),
      ],
    );
  }

  void _showActionMenu(BuildContext context, Map<String, dynamic> tx) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: const Color(0xFF131313),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            border: Border.all(color: _activeNeon.withOpacity(0.3), width: 1.5),
            boxShadow: [
              BoxShadow(color: _activeNeon.withOpacity(0.1), blurRadius: 40, spreadRadius: 0) // Glow up
            ]
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 24),
              Text(
                'Opciones Administrativas',
                style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 24),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.blue.withOpacity(0.1)),
                  child: const Icon(Icons.edit, color: Colors.blue),
                ),
                title: Text('Editar Transacción', style: GoogleFonts.spaceGrotesk(color: Colors.white)),
                onTap: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Modo de edición habilitado para admin.')));
                },
              ),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.red.withOpacity(0.1)),
                  child: const Icon(Icons.cancel, color: Colors.redAccent),
                ),
                title: Text('Anular Registro', style: GoogleFonts.spaceGrotesk(color: Colors.redAccent, fontWeight: FontWeight.bold)),
                subtitle: Text('Esta acción requiere el PIN de super-admin.', style: GoogleFonts.spaceGrotesk(color: Colors.grey, fontSize: 11)),
                onTap: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Anulando registro...')));
                },
              ),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }
}
