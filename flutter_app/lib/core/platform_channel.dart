import 'package:flutter/services.dart';

class PlatformChannel {
  static const MethodChannel _channel = MethodChannel('com.example.ai_assist/channel');

  static Future<bool> checkOverlayPermission() async {
    return await _channel.invokeMethod<bool>('checkOverlayPermission') ?? false;
  }

  static Future<bool> requestOverlayPermission() async {
    return await _channel.invokeMethod<bool>('requestOverlayPermission') ?? false;
  }

  static Future<bool> startFloatingHead() async {
    return await _channel.invokeMethod<bool>('startFloatingHead') ?? false;
  }

  static Future<bool> stopFloatingHead() async {
    return await _channel.invokeMethod<bool>('stopFloatingHead') ?? false;
  }
}
