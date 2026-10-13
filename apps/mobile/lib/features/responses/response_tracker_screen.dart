import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class ResponseTrackerScreen extends StatelessWidget {
  final Map<String, dynamic> request;

  const ResponseTrackerScreen({
    super.key,
    required this.request,
  });

  void _showAuthorizedContactModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDCFCE7),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'Authorized Contact Grant',
                      style: TextStyle(
                        color: AppTheme.statusAvailable,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(ctx).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Text(
                'Tanvir Ahmed (Accepted Donor)',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const Text(
                'North Western University (CSE Department)',
                style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceMuted,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.phone_android, color: AppTheme.brandPrimary, size: 28),
                    SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '+880 1700-000001',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        Text(
                          'Verified Bangladeshi Number',
                          style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Calling donor +8801700000001...'),
                            backgroundColor: AppTheme.brandPrimary,
                          ),
                        );
                      },
                      icon: const Icon(Icons.call),
                      label: const Text('CALL NOW'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Opening WhatsApp coordination...'),
                            backgroundColor: AppTheme.statusAvailable,
                          ),
                        );
                      },
                      icon: const Icon(Icons.chat, color: AppTheme.statusAvailable),
                      label: const Text('WHATSAPP'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Donor Responses'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Request Summary Card
          Card(
            color: Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${request['hospital']}',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Blood Group: ${request['bloodGroup']} • ${request['units']} Units needed',
                    style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                  ),
                  const SizedBox(height: 12),
                  const LinearProgressIndicator(
                    value: 0.5,
                    backgroundColor: AppTheme.surfaceMuted,
                    valueColor: AlwaysStoppedAnimation<Color>(AppTheme.brandPrimary),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    '1 of 2 required donors accepted',
                    style: TextStyle(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          const Text(
            'Accepted Donors (1)',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
          ),
          const SizedBox(height: 8),

          // Accepted Donor Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            backgroundColor: AppTheme.brandSurface,
                            child: Icon(Icons.person, color: AppTheme.brandPrimary),
                          ),
                          SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Tanvir Ahmed',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                              Text(
                                'NWU Member • Verified Donor',
                                style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Text(
                        'Accepted 15m ago',
                        style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () => _showAuthorizedContactModal(context),
                    icon: const Icon(Icons.contact_phone_outlined, size: 18),
                    label: const Text('VIEW VERIFIED CONTACT NUMBER'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
