import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/constants/synthetic_data.dart';

class CreateRequestScreen extends StatefulWidget {
  const CreateRequestScreen({super.key});

  @override
  State<CreateRequestScreen> createState() => _CreateRequestScreenState();
}

class _CreateRequestScreenState extends State<CreateRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  String _selectedBloodGroup = 'B+';
  String _selectedUpazila = 'Boyra';
  String _urgency = 'EMERGENCY';
  int _unitsNeeded = 1;
  final _hospitalController = TextEditingController(text: 'Khulna Medical College Hospital (KMCH)');
  final _detailsController = TextEditingController();

  @override
  void dispose() {
    _hospitalController.dispose();
    _detailsController.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Emergency Request for $_selectedBloodGroup created at ${_hospitalController.text}. Notifying matching donors...',
          ),
          backgroundColor: AppTheme.brandPrimary,
          duration: const Duration(seconds: 4),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('New Blood Request'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Disclaimer Banner
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.brandSurface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.brandBorder),
              ),
              child: const Row(
                children: [
                  Icon(Icons.privacy_tip_outlined, color: AppTheme.brandPrimary, size: 20),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Your contact phone will only be shared with donors who explicitly accept this request.',
                      style: TextStyle(fontSize: 11, color: AppTheme.textSecondary, height: 1.3),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Blood Group Selector
            const Text(
              'Required Blood Group',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textPrimary),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: SyntheticData.bloodGroups.map((bg) {
                final isSelected = _selectedBloodGroup == bg;
                return ChoiceChip(
                  label: Text(
                    bg,
                    style: TextStyle(
                      color: isSelected ? Colors.white : AppTheme.textPrimary,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
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
                    if (val) setState(() => _selectedBloodGroup = bg);
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 20),

            // Units Needed
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Units (Bags) Needed',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textPrimary),
                ),
                Row(
                  children: [
                    IconButton.outlined(
                      icon: const Icon(Icons.remove, size: 16),
                      onPressed: _unitsNeeded > 1
                          ? () => setState(() => _unitsNeeded--)
                          : null,
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        '$_unitsNeeded',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                    IconButton.outlined(
                      icon: const Icon(Icons.add, size: 16),
                      onPressed: _unitsNeeded < 10
                          ? () => setState(() => _unitsNeeded++)
                          : null,
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Hospital Name
            const Text(
              'Hospital / Clinic Name',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textPrimary),
            ),
            const SizedBox(height: 6),
            TextFormField(
              controller: _hospitalController,
              decoration: const InputDecoration(
                hintText: 'e.g. Khulna Medical College Hospital (KMCH)',
              ),
              validator: (val) {
                if (val == null || val.trim().isEmpty) {
                  return 'Please specify the hospital name';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Location / Upazila
            const Text(
              'Hospital Area / Upazila',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textPrimary),
            ),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              initialValue: _selectedUpazila,
              decoration: const InputDecoration(),
              items: SyntheticData.khulnaUpazilas
                  .where((u) => u != 'All Areas')
                  .map((u) => DropdownMenuItem(value: u, child: Text(u)))
                  .toList(),
              onChanged: (val) {
                if (val != null) setState(() => _selectedUpazila = val);
              },
            ),
            const SizedBox(height: 16),

            // Urgency
            const Text(
              'Urgency Level',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textPrimary),
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                _buildUrgencyChip('EMERGENCY', '< 6 Hours', AppTheme.statusCritical),
                const SizedBox(width: 8),
                _buildUrgencyChip('URGENT', 'Today', AppTheme.statusUrgent),
                const SizedBox(width: 8),
                _buildUrgencyChip('NORMAL', 'Scheduled', AppTheme.statusCooldown),
              ],
            ),
            const SizedBox(height: 16),

            // Clinical Details
            const Text(
              'Situation Note (Optional)',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textPrimary),
            ),
            const SizedBox(height: 6),
            TextFormField(
              controller: _detailsController,
              maxLines: 2,
              decoration: const InputDecoration(
                hintText: 'e.g. Surgery scheduled, Thalassemia patient, ICU Ward 4',
              ),
            ),
            const SizedBox(height: 28),

            // Submit Button
            ElevatedButton(
              onPressed: _submit,
              child: const Text('SUBMIT EMERGENCY REQUEST'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUrgencyChip(String level, String desc, Color color) {
    final isSelected = _urgency == level;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _urgency = level),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? color : Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? color : AppTheme.borderSubtle,
              width: 1.5,
            ),
          ),
          alignment: Alignment.center,
          child: Column(
            children: [
              Text(
                level,
                style: TextStyle(
                  color: isSelected ? Colors.white : AppTheme.textPrimary,
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                ),
              ),
              Text(
                desc,
                style: TextStyle(
                  color: isSelected ? Colors.white70 : AppTheme.textSecondary,
                  fontSize: 9,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
