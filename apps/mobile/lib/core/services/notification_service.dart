import 'package:flutter/foundation.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('[FCM Background] Handling message: ${message.messageId} - ${message.notification?.title}');
}

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  String? _deviceToken;
  String? get deviceToken => _deviceToken;

  Future<void> initialize() async {
    try {
      // 1. Request permission for iOS & Android 13+
      NotificationSettings settings = await _fcm.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      debugPrint('[FCM] Permission status: ${settings.authorizationStatus}');

      // 2. Set background message handler
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // 3. Retrieve device FCM token
      _deviceToken = await _fcm.getToken();
      debugPrint('[FCM] Device Token: $_deviceToken');

      // 4. Token refresh listener
      _fcm.onTokenRefresh.listen((newToken) {
        _deviceToken = newToken;
        debugPrint('[FCM] Refreshed Token: $newToken');
      });

      // 5. Handle foreground notifications
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('[FCM Foreground] Received: ${message.notification?.title} - ${message.notification?.body}');
      });

      // 6. Handle notification click when app opens from background
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint('[FCM AppOpened] Clicked on notification: ${message.data}');
      });
    } catch (e) {
      debugPrint('[FCM] Initialization warning (running on non-supported platform or emulator): $e');
    }
  }
}
