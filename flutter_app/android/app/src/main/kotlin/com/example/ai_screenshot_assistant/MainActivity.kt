package com.example.ai_screenshot_assistant

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.annotation.NonNull
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import com.example.ai_screenshot_assistant.service.FloatingService

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.example.ai_assist/channel"
    private val REQUEST_OVERLAY = 2001
    private val REQUEST_PROJECTION = 2002
    private var methodResult: MethodChannel.Result? = null
    private lateinit var projectionManager: MediaProjectionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        projectionManager = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
    }

    override fun configureFlutterEngine(@NonNull flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "checkOverlayPermission" -> {
                    val hasPerm = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        Settings.canDrawOverlays(this)
                    } else true
                    result.success(hasPerm)
                }
                "requestOverlayPermission" -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
                        methodResult = result
                        val intent = Intent(
                            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                            Uri.parse("package:$packageName")
                        )
                        startActivityForResult(intent, REQUEST_OVERLAY)
                    } else {
                        result.success(true)
                    }
                }
                "startFloatingHead" -> {
                    methodResult = result
                    val intent = projectionManager.createScreenCaptureIntent()
                    startActivityForResult(intent, REQUEST_PROJECTION)
                }
                "stopFloatingHead" -> {
                    stopService(Intent(this, FloatingService::class.java))
                    result.success(true)
                }
                else -> result.notImplemented()
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_OVERLAY) {
            val hasPerm = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Settings.canDrawOverlays(this)
            } else true
            methodResult?.success(hasPerm)
            methodResult = null
        }
        if (requestCode == REQUEST_PROJECTION) {
            if (resultCode == Activity.RESULT_OK && data != null) {
                val serviceIntent = Intent(this, FloatingService::class.java).apply {
                    putExtra(FloatingService.EXTRA_RESULT_CODE, resultCode)
                    putExtra(FloatingService.EXTRA_RESULT_DATA, data)
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    startForegroundService(serviceIntent)
                } else {
                    startService(serviceIntent)
                }
                methodResult?.success(true)
            } else {
                methodResult?.success(false)
            }
            methodResult = null
        }
    }
}
