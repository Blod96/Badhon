import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/constants/synthetic_data.dart';
import '../responses/response_tracker_screen.dart';

class MyRequestsScreen extends StatelessWidget {
  final VoidCallback onOpenCreateRequest;

  const MyRequestsScreen({
    super.key,
    required this.onOpenCreateRequest,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Emergency Requests'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: AppTheme.brandPrimary),
            onPressed: onOpenCreateRequest,
            tooltip: 'New Request',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          ...SyntheticData.requests.map((req) {
            final isOpen = req['status'] == 'OPEN';
            return Card(
              margin: const EdgeInsets.only(bottom: 14),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: isOpen ? const Color(0xFFDCFCE7) : const Color(0xFFEFF6FF),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            req['status'] as String,
                            style: TextStyle(
                              color: isOpen ? AppTheme.statusAvailable : Colors.blue[700],
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        Text(
                          'Target: ${req['bloodGroup']} (${req['units']} Units)',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      req['hospital'] as String,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Area: ${req['upazila']} • Needed: ${req['neededAt']}',
                      style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => ResponseTrackerScreen(request: req),
                                ),
                              );
                            },
                            icon: const Icon(Icons.people_outline, size: 18),
                            label: const Text('TRACK DONOR RESPONSES'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.brandPrimary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (isOpen) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Request marked as FULFILLED. Donors notified with thanks.'),
                                    backgroundColor: Colors.green,
                                  ),
                                );
                              },
                              icon: const Icon(Icons.check_circle_outline, size: 16, color: Colors.green),
                              label: const Text('Fulfilled', style: TextStyle(fontSize: 12)),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Request CANCELLED. Associated contact grants revoked.'),
                                    backgroundColor: Colors.orange,
                                  ),
                                );
                              },
                              icon: const Icon(Icons.cancel_outlined, size: 16, color: Colors.red),
                              label: const Text('Cancel', style: TextStyle(fontSize: 12)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
