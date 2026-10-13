import 'dart:async';

class UserSession {
  final String uid;
  final String displayName;
  final String email;
  final String? phoneNumber;
  final bool isPhoneVerified;
  final String bloodGroup;
  final bool isAdmin;

  UserSession({
    required this.uid,
    required this.displayName,
    required this.email,
    this.phoneNumber,
    this.isPhoneVerified = false,
    this.bloodGroup = 'B+',
    this.isAdmin = false,
  });
}

class AuthService {
  // Singleton pattern
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  UserSession? _currentUser = UserSession(
    uid: 'synthetic-user-123',
    displayName: 'Tanvir Ahmed',
    email: 'tanvir.cse@nwu.edu.bd',
    phoneNumber: '+8801700000001',
    isPhoneVerified: true,
    bloodGroup: 'B+',
  );

  final _userStreamController = StreamController<UserSession?>.broadcast();
  Stream<UserSession?> get userStream => _userStreamController.stream;

  UserSession? get currentUser => _currentUser;

  Future<UserSession> signInWithGoogle() async {
    // Simulated Google Auth Session for Phase 3 Mobile Prototype
    await Future.delayed(const Duration(milliseconds: 500));
    _currentUser = UserSession(
      uid: 'synthetic-user-123',
      displayName: 'Tanvir Ahmed',
      email: 'tanvir.cse@nwu.edu.bd',
      phoneNumber: '+8801700000001',
      isPhoneVerified: true,
      bloodGroup: 'B+',
    );
    _userStreamController.add(_currentUser);
    return _currentUser!;
  }

  Future<void> linkPhoneNumber(String phone, String smsCode) async {
    await Future.delayed(const Duration(milliseconds: 400));
    if (_currentUser != null) {
      _currentUser = UserSession(
        uid: _currentUser!.uid,
        displayName: _currentUser!.displayName,
        email: _currentUser!.email,
        phoneNumber: phone,
        isPhoneVerified: true,
        bloodGroup: _currentUser!.bloodGroup,
        isAdmin: _currentUser!.isAdmin,
      );
      _userStreamController.add(_currentUser);
    }
  }

  Future<void> signOut() async {
    await Future.delayed(const Duration(milliseconds: 200));
    _currentUser = null;
    _userStreamController.add(null);
  }
}
