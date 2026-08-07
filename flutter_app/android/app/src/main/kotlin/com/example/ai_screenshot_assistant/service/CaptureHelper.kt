package com.example.ai_screenshot_assistant.service

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.PixelFormat
import android.hardware.display.DisplayManager
import android.media.Image
import android.media.ImageReader
import android.media.projection.MediaProjectionManager
import android.util.DisplayMetrics
import android.view.WindowManager
import java.io.ByteArrayOutputStream

class CaptureHelper(private val context: Context) {
    private val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private val projectionManager = context.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager

    @SuppressLint("WrongConstant")
    fun capture(resultCode: Int, resultData: Intent): ByteArray? {
        val metrics = DisplayMetrics()
        windowManager.defaultDisplay.getRealMetrics(metrics)
        val width = metrics.widthPixels
        val height = metrics.heightPixels
        val density = metrics.densityDpi

        val mediaProjection = projectionManager.getMediaProjection(resultCode, resultData) ?: return null
        val reader = ImageReader.newInstance(width, height, PixelFormat.RGBA_8888, 2)
        
        val display = mediaProjection.createVirtualDisplay(
            "Capture", width, height, density,
            DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
            reader.surface, null, null
        )

        Thread.sleep(400)

        var image: Image? = null
        var bytes: ByteArray? = null
        try {
            image = reader.acquireLatestImage()
            if (image != null) {
                val plane = image.planes[0]
                val buffer = plane.buffer
                val pixelStride = plane.pixelStride
                val rowStride = plane.rowStride
                val rowPadding = rowStride - pixelStride * width

                val rawBitmap = Bitmap.createBitmap(
                    width + rowPadding / pixelStride,
                    height,
                    Bitmap.Config.ARGB_8888
                )
                rawBitmap.copyPixelsFromBuffer(buffer)
                
                val cleanBitmap = Bitmap.createBitmap(rawBitmap, 0, 0, width, height)
                
                val outputStream = ByteArrayOutputStream()
                cleanBitmap.compress(Bitmap.CompressFormat.PNG, 80, outputStream)
                bytes = outputStream.toByteArray()
                
                rawBitmap.recycle()
                cleanBitmap.recycle()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            image?.close()
            display?.release()
            reader.close()
            mediaProjection.stop()
        }
        return bytes
    }
}
