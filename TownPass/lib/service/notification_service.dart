import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

class NotificationService {
  final FlutterLocalNotificationsPlugin _notifyPlugin =
      FlutterLocalNotificationsPlugin();
  static const _chanelName = "me.liucx.demoNotification"; // channel name

  // 單例模式
  static final NotificationService _instance = NotificationService._internal();

  factory NotificationService() {
    return _instance;
  }

  NotificationService._internal();

  // 初始化通知
  void initialize() {
    final InitializationSettings initSetting = InitializationSettings(
        android: const AndroidInitializationSettings('@mipmap/ic_launcher'),
        iOS: DarwinInitializationSettings());
    _notifyPlugin.initialize(initSetting,
        onDidReceiveNotificationResponse: _notifyReceiveAndroid);
  }

  // 顯示即時通知
  Future<void> showNotification(
      int id, String title, String content, String payload) async {
    await _notifyPlugin.show(
        id,
        title,
        content,
        const NotificationDetails(
            android: AndroidNotificationDetails(_chanelName, _chanelName),
            iOS: DarwinNotificationDetails(
              threadIdentifier: _chanelName,
            )),
        payload: payload);
  }

  // 顯示定時通知
  Future<void> showScheduledNotification(int id, String title, String content,
      String payload, Duration setTime) async {
    tz.initializeTimeZones();
    await _notifyPlugin.zonedSchedule(
        id,
        title,
        content,
        tz.TZDateTime.now(tz.local).add(setTime),
        const NotificationDetails(
            android: AndroidNotificationDetails(_chanelName, _chanelName),
            iOS: DarwinNotificationDetails(threadIdentifier: _chanelName)),
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
        payload: payload);
  }

  // 接收通知回調
  void _notifyReceiveAndroid(NotificationResponse notificationResponse) async {
    final String? payload = notificationResponse.payload;
    if (payload != null) {
      print("Received notification with payload: $payload");
      // 這裡可以根據 payload 執行對應的操作
    }
  }
}
