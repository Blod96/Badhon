class SyntheticData {
  static const List<String> bloodGroups = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  static const List<String> khulnaUpazilas = [
    'All Areas',
    'Sonadanga',
    'Khalishpur',
    'Boyra',
    'Daulatpur',
    'Khan Jahan Ali',
    'Rupsha',
    'Phultala'
  ];

  static final List<Map<String, dynamic>> donors = [
    {
      'id': 'd1',
      'name': 'Tanvir Ahmed',
      'bloodGroup': 'O+',
      'upazila': 'Sonadanga',
      'affiliation': 'NWU CSE Student',
      'isAvailable': true,
      'isVerified': true,
    },
    {
      'id': 'd2',
      'name': 'Nusrat Jahan',
      'bloodGroup': 'A+',
      'upazila': 'Khalishpur',
      'affiliation': 'NWU BBA Faculty',
      'isAvailable': true,
      'isVerified': true,
    },
    {
      'id': 'd3',
      'name': 'Rashedul Karim',
      'bloodGroup': 'B+',
      'upazila': 'Boyra',
      'affiliation': 'Community Donor',
      'isAvailable': true,
      'isVerified': false,
    },
    {
      'id': 'd4',
      'name': 'Mehedi Hasan',
      'bloodGroup': 'O-',
      'upazila': 'Sonadanga',
      'affiliation': 'NWU Law Alumni',
      'isAvailable': true,
      'isVerified': true,
    },
  ];

  static final List<Map<String, dynamic>> requests = [
    {
      'id': 'req-101',
      'bloodGroup': 'B+',
      'units': 2,
      'hospital': 'Khulna Medical College Hospital (KMCH)',
      'upazila': 'Boyra',
      'urgency': 'EMERGENCY',
      'neededAt': 'Within 4 hours',
      'status': 'OPEN',
      'details': 'Emergency C-Section surgery at KMCH Ward 5.',
    },
    {
      'id': 'req-102',
      'bloodGroup': 'O-',
      'units': 1,
      'hospital': 'Gazi Medical College Hospital',
      'upazila': 'Sonadanga',
      'urgency': 'URGENT',
      'neededAt': 'Tomorrow 9:00 AM',
      'status': 'IN_PROGRESS',
      'details': 'Regular transfusion for Thalassemia patient.',
    },
  ];

  static final List<Map<String, dynamic>> notifications = [
    {
      'id': 'notif-1',
      'title': 'Emergency Match Alert: B+ at KMCH',
      'body': 'A patient urgently needs 2 bags of B+ blood at KMCH Boyra. Can you donate?',
      'time': '10 mins ago',
      'isRead': false,
      'requestId': 'req-101',
    },
    {
      'id': 'notif-2',
      'title': 'Donor Accepted Your Request',
      'body': 'A verified donor has accepted your blood request for KMCH. Tap to view contact.',
      'time': '1 hour ago',
      'isRead': true,
      'requestId': 'req-101',
    },
  ];
}
