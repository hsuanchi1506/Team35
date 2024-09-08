import 'package:flutter/material.dart';
import 'package:town_pass/page/Home.dart'; // 引入 HomePage
import 'package:town_pass/gen/assets.gen.dart';
import 'package:town_pass/service/account_service.dart';
import 'package:town_pass/service/device_service.dart';
import 'package:town_pass/service/geo_locator_service.dart';
import 'package:town_pass/service/package_service.dart';
import 'package:town_pass/util/tp_colors.dart';
import 'package:town_pass/util/tp_route.dart';
import 'package:town_pass/service/shared_preferences_service.dart';
import 'package:flutter/services.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:get/get.dart';
import 'package:town_pass/service/notification_service.dart'; // 引入通知服务

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 初始化通知服务
  final NotificationService notificationService = NotificationService();
  notificationService.initialize(); // 确保通知服务初始化

  // 初始化其他服务
  await initServices();

  // 设置系统 UI 样式
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
    ),
  );

  // 启动应用，传递通知服务实例
  runApp(MyApp(notificationService: notificationService));
}

// 初始化应用需要的各种服务
Future<void> initServices() async {
  await Get.putAsync<AccountService>(() async => await AccountService().init());
  await Get.putAsync<DeviceService>(() async => await DeviceService().init());
  await Get.putAsync<PackageService>(() async => await PackageService().init());
  await Get.putAsync<SharedPreferencesService>(() async => await SharedPreferencesService().init());
  await Get.putAsync<GeoLocatorService>(() async => await GeoLocatorService().init());
}

class MyApp extends StatefulWidget {
  final NotificationService notificationService; // 接收通知服务

  const MyApp({super.key, required this.notificationService});

  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {

  @override
  void initState() {
    super.initState();
    
    // // 延遲 3 秒後執行通知顯示
    // Future.delayed(Duration(seconds: 3), () {
    //   widget.notificationService.showNotification(
    //     1,
    //     'Test Notification',
    //     'This is a test notification',
    //     'Payload data',
    //   );
    // });
  }

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'City Pass',
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: TPColors.grayscale50,
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: TPColors.white,
        ),
        colorScheme: ColorScheme.fromSeed(seedColor: TPColors.primary500),
        appBarTheme: const AppBarTheme(
          centerTitle: true,
          elevation: 0.0,
          iconTheme: IconThemeData(size: 56),
          actionsIconTheme: IconThemeData(size: 56),
        ),
        actionIconTheme: ActionIconThemeData(
          backButtonIconBuilder: (_) => Assets.svg.iconLeftArrow.svg(width: 24, height: 24),
        ),
      ),
      debugShowCheckedModeBanner: false,
      initialRoute: TPRoute.holder,
      getPages: TPRoute.page,
    );
  }
}