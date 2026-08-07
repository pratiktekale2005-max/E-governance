package com.example.aiscreenshotanalyzer.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.*
import android.view.View.OnTouchListener
import android.view.animation.OvershootInterpolator
import android.widget.Button
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.core.app.NotificationCompat
import androidx.lifecycle.LifecycleService
import androidx.lifecycle.lifecycleScope
import com.example.aiscreenshotanalyzer.MainActivity
import com.example.aiscreenshotanalyzer.R
import com.example.aiscreenshotanalyzer.network.ApiClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import kotlin.math.abs

class FloatingWidgetService : LifecycleService() {

    private lateinit var windowManager: WindowManager
    private lateinit var overlayView: View
    private lateinit var params: WindowManager.LayoutParams
    
    private var isExpanded = false
    private var resultCode: Int = 0
    private var resultData: Intent? = null
    
    private lateinit var collapsedWidget: View
    private lateinit var expandedPanel: View
    private lateinit var screenshotPreview: ImageView
    private lateinit var loadingSpinner: View
    private lateinit var responseContainer: View
    private lateinit var errorTitleTv: TextView
    private lateinit var explanationTv: TextView
    private lateinit var solutionTv: TextView

    private var lastCapturedBitmap: Bitmap? = null
    private var lastCapturedFile: File? = null

    companion object {
        private const val NOTIFICATION_ID = 8871
        private const val CHANNEL_ID = "floating_widget_channel"
        const val EXTRA_RESULT_CODE = "extra_result_code"
        const val EXTRA_RESULT_DATA = "extra_result_data"
    }

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)
        
        intent?.let {
            resultCode = it.getIntExtra(EXTRA_RESULT_CODE, 0)
            resultData = it.getParcelableExtra(EXTRA_RESULT_DATA)
        }

        val notification = createForegroundNotification()
        startForeground(NOTIFICATION_ID, notification)

        initWindowOverlays()

        return START_NOT_STICKY
    }

    private fun initWindowOverlays() {
        overlayView = LayoutInflater.from(this).inflate(R.layout.floating_widget_layout, null)

        val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 100
            y = 200
        }

        collapsedWidget = overlayView.findViewById(R.id.collapsed_widget)
        expandedPanel = overlayView.findViewById(R.id.expanded_panel)
        screenshotPreview = overlayView.findViewById(R.id.iv_screenshot_preview)
        loadingSpinner = overlayView.findViewById(R.id.loading_layout)
        responseContainer = overlayView.findViewById(R.id.response_scrollview)
        errorTitleTv = overlayView.findViewById(R.id.tv_error_title)
        explanationTv = overlayView.findViewById(R.id.tv_explanation)
        solutionTv = overlayView.findViewById(R.id.tv_solution)

        setupGestures()

        overlayView.findViewById<View>(R.id.btn_close).setOnClickListener { minimizeWidget() }
        overlayView.findViewById<Button>(R.id.btn_retry).setOnClickListener { initiateScreenAnalysis() }
        overlayView.findViewById<Button>(R.id.btn_analyze_last).setOnClickListener { loadLastCachedAnalysis() }

        windowManager.addView(overlayView, params)
    }

    private fun setupGestures() {
        var initialX = 0
        var initialY = 0
        var initialTouchX = 0.0f
        var initialTouchY = 0.0f
        var clickStartTime: Long = 0

        collapsedWidget.setOnTouchListener(object : OnTouchListener {
            override fun onTouch(v: View?, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params.x
                        initialY = params.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        clickStartTime = System.currentTimeMillis()
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        params.x = initialX + (event.rawX - initialTouchX).toInt()
                        params.y = initialY + (event.rawY - initialTouchY).toInt()
                        windowManager.updateViewLayout(overlayView, params)
                        return true
                    }
                    MotionEvent.ACTION_UP -> {
                        val duration = System.currentTimeMillis() - clickStartTime
                        val deltaX = abs(event.rawX - initialTouchX)
                        val deltaY = abs(event.rawY - initialTouchY)

                        if (duration < 250 && deltaX < 10 && deltaY < 10) {
                            maximizeWidget()
                        } else {
                            snapToBorders(event.rawX)
                        }
                        return true
                    }
                }
                return false
            }
        })
    }

    private fun snapToBorders(finishX: Float) {
        val screenWidth = windowManager.defaultDisplay.width
        val middleX = screenWidth / 2
        val targetX = if (finishX < middleX) 0 else screenWidth - collapsedWidget.width

        lifecycleScope.launch(Dispatchers.Main) {
            val startX = params.x
            val interpolator = OvershootInterpolator(0.8f)
            val duration = 300L
            val startTime = System.currentTimeMillis()

            while (System.currentTimeMillis() - startTime < duration) {
                val fraction = (System.currentTimeMillis() - startTime).toFloat() / duration
                val interpolatedFraction = interpolator.getInterpolation(fraction)
                params.x = (startX + (targetX - startX) * interpolatedFraction).toInt()
                windowManager.updateViewLayout(overlayView, params)
                kotlinx.coroutines.delay(10)
            }
            params.x = targetX
            windowManager.updateViewLayout(overlayView, params)
        }
    }

    private fun maximizeWidget() {
        if (isExpanded) return
        isExpanded = true
        
        collapsedWidget.visibility = View.GONE
        expandedPanel.visibility = View.VISIBLE
        
        params.flags = WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
        windowManager.updateViewLayout(overlayView, params)

        initiateScreenAnalysis()
    }

    private fun minimizeWidget() {
        if (!isExpanded) return
        isExpanded = false
        
        collapsedWidget.visibility = View.VISIBLE
        expandedPanel.visibility = View.GONE
        
        params.flags = WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
        windowManager.updateViewLayout(overlayView, params)
    }

    private fun initiateScreenAnalysis() {
        val code = resultCode
        val data = resultData
        if (code == 0 || data == null) {
            Toast.makeText(this, "Screen capture credentials expired.", Toast.LENGTH_LONG).show()
            minimizeWidget()
            return
        }

        screenshotPreview.setImageBitmap(null)
        loadingSpinner.visibility = View.VISIBLE
        responseContainer.visibility = View.GONE

        collapsedWidget.visibility = View.GONE
        expandedPanel.visibility = View.GONE
        windowManager.updateViewLayout(overlayView, params)

        lifecycleScope.launch(Dispatchers.Main) {
            kotlinx.coroutines.delay(200)

            val captureResult = MediaProjectionHelper(this@FloatingWidgetService).captureScreen(code, data)

            expandedPanel.visibility = View.VISIBLE
            windowManager.updateViewLayout(overlayView, params)

            if (captureResult != null) {
                val (bitmap, file) = captureResult
                lastCapturedBitmap = bitmap
                lastCapturedFile = file

                screenshotPreview.setImageBitmap(bitmap)
                executeAnalysisApiCall(file)
            } else {
                loadingSpinner.visibility = View.GONE
                errorTitleTv.text = "Failed to Capture Screen"
            }
        }
    }

    private fun executeAnalysisApiCall(file: File) {
        lifecycleScope.launch {
            try {
                val requestFile = file.asRequestBody("image/*".toMediaTypeOrNull())
                val imagePart = MultipartBody.Part.createFormData("image", file.name, requestFile)

                val response = withContext(Dispatchers.IO) {
                    ApiClient.service.analyzeImage(imagePart)
                }

                loadingSpinner.visibility = View.GONE
                responseContainer.visibility = View.VISIBLE
                
                errorTitleTv.text = response.error.ifBlank { "Analysis Completed" }
                explanationTv.text = response.explanation
                solutionTv.text = response.solution

            } catch (e: Exception) {
                loadingSpinner.visibility = View.GONE
                responseContainer.visibility = View.VISIBLE
                errorTitleTv.text = "Analysis Server Error"
                explanationTv.text = "Failed to connect to API backend server."
                solutionTv.text = e.localizedMessage ?: "Unknown network exception occurred."
            }
        }
    }

    private fun loadLastCachedAnalysis() {
        val lastBitmap = lastCapturedBitmap
        val lastFile = lastCapturedFile
        if (lastBitmap == null || lastFile == null) {
            Toast.makeText(this, "No cached screenshot available.", Toast.LENGTH_SHORT).show()
            return
        }

        screenshotPreview.setImageBitmap(lastBitmap)
        loadingSpinner.visibility = View.VISIBLE
        responseContainer.visibility = View.GONE

        lifecycleScope.launch {
            executeAnalysisApiCall(lastFile)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Floating Controller",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun createForegroundNotification(): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Screen Analyzer Overlay Running")
            .setContentText("Tap overlay widget head to capture screen content")
            .setSmallIcon(android.R.drawable.ic_menu_camera)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        if (::overlayView.isInitialized) {
            windowManager.removeView(overlayView)
        }
        lastCapturedBitmap?.recycle()
        lastCapturedBitmap = null
        lastCapturedFile = null
    }

    override fun onBind(intent: Intent): IBinder? {
        super.onBind(intent)
        return null
    }
}
