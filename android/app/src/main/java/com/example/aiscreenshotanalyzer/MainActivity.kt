package com.example.aiscreenshotanalyzer

import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.aiscreenshotanalyzer.service.FloatingWidgetService

class MainActivity : AppCompatActivity() {

    private lateinit var projectionManager: MediaProjectionManager

    companion object {
        private const val REQUEST_CODE_OVERLAY = 1001
        private const val REQUEST_CODE_PROJECTION = 1002
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        projectionManager = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager

        findViewById<Button>(R.id.btn_start_widget).setOnClickListener {
            checkOverlayAndStartService()
        }
    }

    private fun checkOverlayAndStartService() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            startActivityForResult(intent, REQUEST_CODE_OVERLAY)
        } else {
            requestMediaProjectionToken()
        }
    }

    private fun requestMediaProjectionToken() {
        val intent = projectionManager.createScreenCaptureIntent()
        startActivityForResult(intent, REQUEST_CODE_PROJECTION)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == REQUEST_CODE_OVERLAY) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && Settings.canDrawOverlays(this)) {
                requestMediaProjectionToken()
            } else {
                Toast.makeText(this, "Overlay permission is required.", Toast.LENGTH_LONG).show()
            }
        }

        if (requestCode == REQUEST_CODE_PROJECTION) {
            if (resultCode == RESULT_OK && data != null) {
                val serviceIntent = Intent(this, FloatingWidgetService::class.java).apply {
                    putExtra(FloatingWidgetService.EXTRA_RESULT_CODE, resultCode)
                    putExtra(FloatingWidgetService.EXTRA_RESULT_DATA, data)
                }
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    startForegroundService(serviceIntent)
                } else {
                    startService(serviceIntent)
                }
                finish()
            } else {
                Toast.makeText(this, "Screen capture permission denied.", Toast.LENGTH_LONG).show()
            }
        }
    }
}
