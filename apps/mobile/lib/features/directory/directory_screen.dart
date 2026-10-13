import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/constants/synthetic_data.dart';

class DirectoryScreen extends StatefulWidget {
  final VoidCallback onOpenCreateRequest;

  const DirectoryScreen({
    super.key,
    required this.onOpenCreateRequest,
  });

  @override
  State<DirectoryScreen> createState() => _DirectoryScreenState();
}

class _DirectoryScreenState extends State<DirectoryScreen> {
  String _selectedGroup = 'All';
  String _selectedUpazila = 'All Areas';

  @override
  Widget build(BuildContext context) {
    final filteredDonors = SyntheticData.donors.where((donor) {
      if (_selectedGroup != 'All' && donor['bloodGroup'] != _selectedGroup) {
        return false;
      }
      if (_selectedUpazila != 'All Areas' && donor['upazila'] != _selectedUpazila) {
        return false;
      }
      return true;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sanitized Donor Directory'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(100),
          child: Column(
            children: [
              // Blood Group Filter Pills
              SizedBox(
                height: 42,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    _buildPill('All'),
                    ...SyntheticData.bloodGroups.map((bg) => _buildPill(bg)),
                  ],
                ),
              ),
              const SizedBox(height: 8),

              // Upazila Dropdown & Privacy Notice
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppTheme.borderSubtle),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _selectedUpazila,
                            isDense: true,
                            style: const TextStyle(fontSize: 12, color: AppTheme.textPrimary),
                            items: SyntheticData.khulnaUpazilas
                                .map((area) => DropdownMenuItem(
                                      value: area,
                                      child: Text(area),
                                    ))
                                .toList(),
                            onChanged: (val) {
                              if (val != null) {
                                setState(() => _selectedUpazila = val);
                              }
                            },
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppTheme.brandSurface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppTheme.brandBorder),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.lock_outline, size: 14, color: AppTheme.brandPrimary),
                          SizedBox(width: 4),
                          Text(
                            'Phone Protected',
                            style: TextStyle(
                              fontSize: 11,
                              color: AppTheme.brandPrimary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
      body: filteredDonors.isEmpty
          ? const Center(
              child: Text(
                'No donors found for this filter.',
                style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: filteredDonors.length,
              itemBuilder: (context, index) {
                final donor = filteredDonors[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: AppTheme.brandSurface,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppTheme.brandBorder),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                donor['bloodGroup'] as String,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.brandPrimary,
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        donor['name'] as String,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 15,
                                          color: AppTheme.textPrimary,
                                        ),
                                      ),
                                      if (donor['isVerified'] == true) ...[
                                        const SizedBox(width: 4),
                                        const Icon(
                                          Icons.check_circle,
                                          color: AppTheme.brandPrimary,
                                          size: 16,
                                        ),
                                      ],
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${donor['upazila']} • ${donor['affiliation']}',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppTheme.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFDCFCE7),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                'Available',
                                style: TextStyle(
                                  color: AppTheme.statusAvailable,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Divider(height: 1, color: AppTheme.borderSubtle),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Direct contact shared via emergency request only.',
                              style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                            ),
                            GestureDetector(
                              onTap: widget.onOpenCreateRequest,
                              child: const Text(
                                'Request Blood',
                                style: TextStyle(
                                  color: AppTheme.brandPrimary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }

  Widget _buildPill(String label) {
    final isSelected = _selectedGroup == label;
    return GestureDetector(
      onTap: () => setState(() => _selectedGroup = label),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.brandPrimary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppTheme.brandPrimary : AppTheme.borderSubtle,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : AppTheme.textSecondary,
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}

