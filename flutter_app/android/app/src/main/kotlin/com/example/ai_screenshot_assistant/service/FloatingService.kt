package com.example.ai_screenshot_assistant.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.*
import android.widget.ImageView
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class FloatingService : Service() {
    private lateinit var windowManager: WindowManager
    private var floatingView: View? = null
    private var resultCode: Int = 0
    private var resultData: Intent? = null

    companion object {
        const val EXTRA_RESULT_CODE = "extra_result_code"
        const val EXTRA_RESULT_DATA = "extra_result_data"
        private const val NOTIF_ID = 9012
        private const val CHANNEL_ID = "floating_service_channel"
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        createChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        intent?.let {
            resultCode = it.getIntExtra(EXTRA_RESULT_CODE, 0)
            resultData = it.getParcelableExtra(EXTRA_RESULT_DATA)
        }

        startForeground(NOTIF_ID, getNotif())
        showFloatingHead()
        return START_NOT_STICKY
    }

    private fun showFloatingHead() {
        val floatButton = ImageView(this).apply {
            setImageResource(android.R.drawable.ic_menu_camera)
            setBackgroundColor(0xFF7C4DFF.toInt())
            setPadding(30, 30, 30, 30)
        }

        val flag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            flag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 100
            y = 200
        }

        floatButton.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f
            private var startTime = 0L

            override fun onTouch(v: View?, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params.x
                        initialY = params.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        startTime = System.currentTimeMillis()
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        params.x = initialX + (event.rawX - initialTouchX).toInt()
                        params.y = initialY + (event.rawY - initialTouchY).toInt()
                        windowManager.updateViewLayout(floatButton, params)
                        return true
                    }
                    MotionEvent.ACTION_UP -> {
                        val duration = System.currentTimeMillis() - startTime
                        if (duration < 200) {
                            captureScreenshot()
                        }
                        return true
                    }
                }
                return false
            }
        })

        floatingView = floatButton
        windowManager.addView(floatButton, params)
    }

    private fun captureScreenshot() {
        val code = resultCode
        val data = resultData ?: return

        floatingView?.visibility = View.GONE

        CoroutineScope(Dispatchers.Main).launch {
            delay(200)
            val bytes = CaptureHelper(this@FloatingService).capture(code, data)
            floatingView?.visibility = View.VISIBLE
            
            if (bytes != null) {
                val intent = Intent("com.example.ai_assist.SCREENSHOT").apply {
                    putExtra("bytes", bytes)
                }
                sendBroadcast(intent)
            }
        }
    }

    private fun getNotif(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("AI Assistant Overlay")
            .setContentText("Tap overlay to capture screen contents")
            .setSmallIcon(android.R.drawable.ic_menu_camera)
            .build()
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(CHANNEL_ID, "Assist", NotificationManager.IMPORTANCE_LOW)
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        floatingView?.let { windowManager.removeView(it) }
    }
}
