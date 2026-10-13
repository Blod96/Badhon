import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/constants/synthetic_data.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late List<Map<String, dynamic>> _notifications;

  @override
  void initState() {
    super.initState();
    _notifications = List.from(SyntheticData.notifications);
  }

  void _showPriorityMatchDialog(Map<String, dynamic> notif) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        titlePadding: EdgeInsets.zero,
        title: Container(
          padding: const EdgeInsets.all(16),
          decoration: const BoxDecoration(
            color: AppTheme.brandSurface,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.brandPrimary,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.emergency_outlined, color: Colors.white, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Emergency Match Alert',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    Text(
                      'Target Request: ${notif['requestId']}',
                      style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              notif['title'] as String,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 8),
            Text(
              notif['body'] as String,
              style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.4),
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.amber[50],
                border: Border.all(color: Colors.amber[200]!),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Row(
                children: [
                  Icon(Icons.shield_outlined, color: Colors.amber, size: 16),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Your phone number will be shared securely only with the verified requester upon acceptance.',
                      style: TextStyle(fontSize: 10, color: Colors.brown),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Request declined.')),
              );
            },
            child: const Text('Decline', style: TextStyle(color: AppTheme.textSecondary)),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.of(ctx).pop();
              setState(() {
                notif['isRead'] = true;
              });
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Thank you! Response recorded as ACCEPTED. Contact grant issued.'),
                  backgroundColor: Colors.green,
                ),
              );
            },
            icon: const Icon(Icons.favorite, size: 16),
            label: const Text('I Can Donate (Accept)'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.brandPrimary,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          TextButton(
            onPressed: () {
              setState(() {
                for (final n in _notifications) {
                  n['isRead'] = true;
                }
              });
            },
            child: const Text('Mark all read', style: TextStyle(fontSize: 12)),
          ),
        ],
      ),
      body: _notifications.isEmpty
          ? const Center(
              child: Padding(
                padding: EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.notifications_none, size: 56, color: AppTheme.borderSubtle),
                    SizedBox(height: 16),
                    Text(
                      'No notifications yet',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textPrimary),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'You will receive match alerts and response updates here.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                    ),
                  ],
                ),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: _notifications.length,
              separatorBuilder: (context, index) => const Divider(height: 1, color: AppTheme.borderSubtle),
              itemBuilder: (context, index) {
          final notif = _notifications[index];
          final isRead = notif['isRead'] as bool;
          return ListTile(
            tileColor: isRead ? Colors.transparent : AppTheme.brandSurface.withValues(alpha: 0.5),
            leading: CircleAvatar(
              backgroundColor: isRead ? AppTheme.surfaceMuted : AppTheme.brandSurface,
              child: Icon(
                Icons.water_drop,
                color: isRead ? AppTheme.textMuted : AppTheme.brandPrimary,
                size: 20,
              ),
            ),
            title: Text(
              notif['title'] as String,
              style: TextStyle(
                fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                fontSize: 13,
                color: AppTheme.textPrimary,
              ),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 2),
                Text(
                  notif['body'] as String,
                  style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                ),
                const SizedBox(height: 4),
                Text(
                  notif['time'] as String,
                  style: const TextStyle(fontSize: 10, color: AppTheme.textMuted),
                ),
              ],
            ),
            trailing: !isRead
                ? Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppTheme.brandPrimary,
                      shape: BoxShape.circle,
                    ),
                  )
                : null,
            onTap: () {
              setState(() {
                notif['isRead'] = true;
              });
              _showPriorityMatchDialog(notif);
            },
          );
        },
      ),
    );
  }
}
