import 'dart:convert';

import 'package:town_pass/util/web_message_handler/tp_web_message_handler.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

abstract class TPWebMessageListener {
  static List<TPWebMessageHandler> get messageHandler => [
        UserinfoWebMessageHandler(),
        LaunchMapWebMessageHandler(),
        PhoneCallMessageHandler(),
        LocationMessageHandler(),
        DeviceInfoMessageHandler(),
        OpenLinkMessageHandler(),
        NotifyWebMessageHandler(),
      ];

  static WebMessageListener webMessageListener() {
    return WebMessageListener(
      jsObjectName: 'flutterObject',
      onPostMessage: (webMessage, sourceOrigin, isMainFrame, replyProxy) async {
        if (webMessage == null) {
          return;
        }

        // print(webMessage.data);
        final Map dataMap = jsonDecode(webMessage.data);
        for (TPWebMessageHandler handler in messageHandler) {
          // print("listen");
          // print(dataMap['name']);
          // print(handler.name);
          if (handler.name == dataMap['name']) {
            // print('in ${dataMap['data']}');
            await handler.handle(
              message: dataMap['data'],
              sourceOrigin: sourceOrigin,
              isMainFrame: isMainFrame,
              onReply: (reply) => replyProxy.postMessage(reply),
            );
          }
        }

      },
    );
  }
}
