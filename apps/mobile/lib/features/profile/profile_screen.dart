import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _publicDirectoryVisible = true;
  bool _urgentOnlyNotifications = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile & Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // User Identity Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: AppTheme.brandSurface,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.brandBorder, width: 2),
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      'B+',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.brandPrimary,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              'Tanvir Ahmed',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            SizedBox(width: 4),
                            Icon(Icons.verified, color: AppTheme.brandPrimary, size: 16),
                          ],
                        ),
                        SizedBox(height: 2),
                        Text(
                          'North Western University (CSE)',
                          style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                        ),
                        Text(
                          'Phone: +880 1700-000001 (Verified)',
                          style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 90-Day Medical Cooldown Section
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Donation Cooldown Status',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Platform enforces a conservative 90-day cooldown following donation.',
                    style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDCFCE7),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.favorite, color: AppTheme.statusAvailable, size: 28),
                      ),
                      const SizedBox(width: 14),
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Eligible to Donate',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                              color: AppTheme.statusAvailable,
                            ),
                          ),
                          Text(
                            'Last Donation: June 20, 2026 (115 days ago)',
                            style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Privacy & Notification Toggles
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: const Text(
                    'Public Directory Visibility',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  subtitle: const Text(
                    'Show sanitized profile in public directory. Phone number is never shown.',
                    style: TextStyle(fontSize: 11),
                  ),
                  value: _publicDirectoryVisible,
                  activeThumbColor: AppTheme.brandPrimary,
                  onChanged: (val) => setState(() => _publicDirectoryVisible = val),
                ),
                const Divider(height: 1, color: AppTheme.borderSubtle),
                SwitchListTile(
                  title: const Text(
                    'Urgent Requests Only',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  subtitle: const Text(
                    'Only notify for critical (<6 hour) requests.',
                    style: TextStyle(fontSize: 11),
                  ),
                  value: _urgentOnlyNotifications,
                  activeThumbColor: AppTheme.brandPrimary,
                  onChanged: (val) => setState(() => _urgentOnlyNotifications = val),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Regional Emergency Hospital Numbers
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Khulna Emergency Hotlines',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  _buildEmergencyContact('KMCH Blood Bank', '+88041-760350'),
                  _buildEmergencyContact('Khulna Sadar Hospital', '+88041-720171'),
                  _buildEmergencyContact('National Emergency', '999'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Logout Button
          OutlinedButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Session signed out successfully.')),
              );
            },
            icon: const Icon(Icons.logout, size: 18),
            label: const Text('LOGOUT'),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildEmergencyContact(String name, String phone) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(name, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
          Text(phone, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.brandPrimary)),
        ],
      ),
    );
  }
}
