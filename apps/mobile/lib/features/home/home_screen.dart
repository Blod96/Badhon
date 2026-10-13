import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/constants/synthetic_data.dart';

class HomeScreen extends StatefulWidget {
  final Function(int) onNavigateTab;
  final VoidCallback onOpenCreateRequest;

  const HomeScreen({
    super.key,
    required this.onNavigateTab,
    required this.onOpenCreateRequest,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isAvailableToDonate = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppTheme.brandSurface,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.brandBorder),
              ),
              child: const Icon(
                Icons.water_drop,
                color: AppTheme.brandPrimary,
                size: 20,
              ),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Badhon বাঁধন',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
                Text(
                  'NWU Blood Connect • Khulna',
                  style: TextStyle(
                    fontSize: 11,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none, color: AppTheme.textSecondary),
            onPressed: () => widget.onNavigateTab(3), // Navigate to Notifications tab
            tooltip: 'Notifications',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        children: [
          // Emergency Ticker Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: AppTheme.brandPrimary,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(Icons.emergency, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'Urgent Need: B+ & O- blood needed at KMCH Boyra.',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () => widget.onNavigateTab(2), // My requests / requests
                  child: const Text(
                    'View',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      decoration: TextDecoration.underline,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Donor Availability Status Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: _isAvailableToDonate
                                  ? const Color(0xFFDCFCE7)
                                  : AppTheme.surfaceMuted,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(
                              _isAvailableToDonate ? Icons.check_circle : Icons.pause_circle,
                              color: _isAvailableToDonate
                                  ? AppTheme.statusAvailable
                                  : AppTheme.statusCooldown,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _isAvailableToDonate ? 'Ready to Donate' : 'In Cooldown / Paused',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                              const Text(
                                'Blood Group: B+ (Eligible)',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Switch(
                        value: _isAvailableToDonate,
                        activeThumbColor: AppTheme.brandPrimary,
                        onChanged: (val) {
                          setState(() {
                            _isAvailableToDonate = val;
                          });
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Divider(height: 1, color: AppTheme.borderSubtle),
                  const SizedBox(height: 10),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Last Donation: 110 days ago',
                        style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                      ),
                      Text(
                        'Public Directory: Visible',
                        style: TextStyle(fontSize: 11, color: AppTheme.statusAvailable, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Primary Action: Request Blood CTA
          ElevatedButton.icon(
            onPressed: widget.onOpenCreateRequest,
            icon: const Icon(Icons.add_circle_outline, size: 20),
            label: const Text('CREATE EMERGENCY BLOOD REQUEST'),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),
          const SizedBox(height: 20),

          // Section Title: Urgent Regional Needs
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Urgent Hospital Needs',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              TextButton(
                onPressed: () => widget.onNavigateTab(1),
                child: const Text(
                  'Browse All',
                  style: TextStyle(color: AppTheme.brandPrimary, fontSize: 13, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Urgent Request Cards Preview
          ...SyntheticData.requests.map((req) {
            final isEmergency = req['urgency'] == 'EMERGENCY';
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(
                  color: isEmergency ? const Color(0xFFFECACA) : AppTheme.borderSubtle,
                  width: isEmergency ? 1.5 : 1,
                ),
              ),
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
                            color: isEmergency ? AppTheme.brandPrimary : const Color(0xFFFEF3C7),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            req['urgency'] as String,
                            style: TextStyle(
                              color: isEmergency ? Colors.white : const Color(0xFF92400E),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        Text(
                          '${req['units']} Bags Needed',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: AppTheme.brandPrimary,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            req['bloodGroup'] as String,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                req['hospital'] as String,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Area: ${req['upazila']} • ${req['neededAt']}',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Responding to emergency request ${req['id']}...'),
                            backgroundColor: AppTheme.brandPrimary,
                          ),
                        );
                      },
                      child: const Text('I CAN DONATE (RESPOND)'),
                    ),
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
