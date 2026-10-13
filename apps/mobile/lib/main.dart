import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'features/home/home_screen.dart';
import 'features/directory/directory_screen.dart';
import 'features/request/my_requests_screen.dart';
import 'features/request/create_request_screen.dart';
import 'features/notifications/notifications_screen.dart';
import 'features/profile/profile_screen.dart';

void main() {
  runApp(const BadhonApp());
}

class BadhonApp extends StatelessWidget {
  const BadhonApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Badhon (বাঁধন) — NWU Blood Connect',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  void _openCreateRequest() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => const CreateRequestScreen(),
      ),
    );
  }

  void _onNavigateTab(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      HomeScreen(
        onNavigateTab: _onNavigateTab,
        onOpenCreateRequest: _openCreateRequest,
      ),
      DirectoryScreen(
        onOpenCreateRequest: _openCreateRequest,
      ),
      MyRequestsScreen(
        onOpenCreateRequest: _openCreateRequest,
      ),
      const NotificationsScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people_outline),
            activeIcon: Icon(Icons.people),
            label: 'Donors',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.bloodtype_outlined),
            activeIcon: Icon(Icons.bloodtype),
            label: 'Requests',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.notifications_none),
            activeIcon: Icon(Icons.notifications),
            label: 'Alerts',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
