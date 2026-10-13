import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/auth_service.dart';
import 'onboarding_screen.dart';

class WelcomeScreen extends StatefulWidget {
  final VoidCallback onAuthenticated;

  const WelcomeScreen({
    super.key,
    required this.onAuthenticated,
  });

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  bool _isLoading = false;

  void _handleGoogleSignIn() async {
    setState(() => _isLoading = true);
    try {
      await AuthService().signInWithGoogle();
      if (mounted) {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => OnboardingScreen(onCompleted: widget.onAuthenticated),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Top Brand Emblem
              Column(
                children: [
                  const SizedBox(height: 40),
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: AppTheme.brandSurface,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.brandBorder, width: 2),
                    ),
                    child: const Icon(
                      Icons.water_drop,
                      color: AppTheme.brandPrimary,
                      size: 38,
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Badhon বাঁধন',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      letterSpacing: -0.5,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'North Western University (NWU) • Khulna',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),

              // Value Proposition Cards
              Column(
                children: [
                  _buildBenefitRow(
                    Icons.privacy_tip_outlined,
                    'Privacy-First Contact Sharing',
                    'Your mobile number is never shown publicly. Shared only when you accept an emergency request.',
                  ),
                  const SizedBox(height: 16),
                  _buildBenefitRow(
                    Icons.medical_services_outlined,
                    'Khulna Regional Transfusion Network',
                    'Direct coordination across KMCH, Gazi Medical, and city healthcare facilities.',
                  ),
                ],
              ),

              // Bottom Actions
              Column(
                children: [
                  ElevatedButton.icon(
                    onPressed: _isLoading ? null : _handleGoogleSignIn,
                    icon: _isLoading
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.g_mobiledata, size: 24),
                    label: Text(_isLoading ? 'Signing In...' : 'SIGN IN WITH GOOGLE'),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'By continuing, you accept the voluntary coordination policy & non-medical disclaimer.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 10, color: AppTheme.textMuted),
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBenefitRow(IconData icon, String title, String subtitle) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppTheme.brandSurface,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: AppTheme.brandPrimary, size: 22),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary, height: 1.3),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
