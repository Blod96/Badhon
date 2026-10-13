import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/constants/synthetic_data.dart';
import '../../core/services/auth_service.dart';

class OnboardingScreen extends StatefulWidget {
  final VoidCallback onCompleted;

  const OnboardingScreen({
    super.key,
    required this.onCompleted,
  });

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  String _bloodGroup = 'B+';
  String _role = 'DONOR';
  final _phoneController = TextEditingController(text: '01712345678');
  final _otpController = TextEditingController();
  final _deptController = TextEditingController(text: 'CSE');
  bool _otpSent = false;
  bool _isSaving = false;

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    _deptController.dispose();
    super.dispose();
  }

  void _verifyAndProceed() async {
    setState(() => _isSaving = true);
    try {
      await AuthService().linkPhoneNumber(_phoneController.text, _otpController.text);
      if (mounted) {
        widget.onCompleted();
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Complete Your Profile'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text(
            'Welcome to NWU Blood Connect',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
          ),
          const SizedBox(height: 4),
          const Text(
            'Select your blood group and verify your Bangladeshi phone number for emergency coordination.',
            style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
          ),
          const SizedBox(height: 20),

          // Blood Group Selection
          const Text(
            'Select Blood Group',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: SyntheticData.bloodGroups.map((bg) {
              final isSelected = _bloodGroup == bg;
              return ChoiceChip(
                label: Text(
                  bg,
                  style: TextStyle(
                    color: isSelected ? Colors.white : AppTheme.textPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                selected: isSelected,
                selectedColor: AppTheme.brandPrimary,
                backgroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: BorderSide(
                    color: isSelected ? AppTheme.brandPrimary : AppTheme.borderSubtle,
                  ),
                ),
                onSelected: (val) {
                  if (val) setState(() => _bloodGroup = bg);
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 20),

          // Role Selection Cards
          const Text(
            'Your Role on Platform',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildRoleCard('DONOR', 'Blood Donor', Icons.volunteer_activism),
              const SizedBox(width: 10),
              _buildRoleCard('REQUESTER', 'Requester', Icons.bloodtype),
              const SizedBox(width: 10),
              _buildRoleCard('BOTH', 'Both', Icons.people),
            ],
          ),
          const SizedBox(height: 20),

          // Department Input
          const Text(
            'NWU Department (Optional)',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          TextFormField(
            controller: _deptController,
            decoration: const InputDecoration(
              hintText: 'e.g. CSE, EEE, BBA, Law',
            ),
          ),
          const SizedBox(height: 20),

          // Phone Number Input
          const Text(
            'Bangladeshi Mobile Number',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    prefixText: '+88 ',
                    hintText: '017XXXXXXXX',
                  ),
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: () {
                  setState(() => _otpSent = true);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('OTP sent to phone: 123456')),
                  );
                },
                child: Text(_otpSent ? 'Resend' : 'Send OTP'),
              ),
            ],
          ),
          const SizedBox(height: 12),

          if (_otpSent) ...[
            const Text(
              'Enter 6-Digit SMS Code',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            TextFormField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              textAlign: TextAlign.center,
              decoration: const InputDecoration(
                hintText: '123456',
              ),
            ),
            const SizedBox(height: 20),
          ],

          const SizedBox(height: 10),
          ElevatedButton(
            onPressed: _isSaving ? null : _verifyAndProceed,
            child: Text(_isSaving ? 'Verifying...' : 'COMPLETE & ENTER BADHON'),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleCard(String roleVal, String title, IconData icon) {
    final isSelected = _role == roleVal;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _role = roleVal),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.brandSurface : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppTheme.brandPrimary : AppTheme.borderSubtle,
              width: 1.5,
            ),
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? AppTheme.brandPrimary : AppTheme.textSecondary, size: 24),
              const SizedBox(height: 6),
              Text(
                title,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? AppTheme.brandPrimary : AppTheme.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
