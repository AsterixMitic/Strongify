package com.example.strongify.notifications

import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.location.Location
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.example.strongify.MainActivity
import com.example.strongify.R
import com.example.strongify.data.MarkerRepository
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.firebase.Firebase
import com.google.firebase.auth.auth
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

class NearbyService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var repository: MarkerRepository

    private val notificationChannelId = "nearby_channel"
    private val radiusMeters = 100.0

    private val notifiedRecords = mutableSetOf<String>()
    private val currentUserId: String? = Firebase.auth.currentUser?.uid

    override fun onCreate() {
        super.onCreate()

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        repository = MarkerRepository()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = NotificationCompat.Builder(this, notificationChannelId)
            .setContentTitle("Strongify aktivan")
            .setContentText("Pratim lokaciju u pozadini")
            .setSmallIcon(R.drawable.strongify_logo)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        startForeground(1, notification)

        startCheckingNearbyRecords()

        return START_STICKY
    }

    @SuppressLint("MissingPermission")
    private fun startLocationUpdates() {
        val locationRequest = com.google.android.gms.location.LocationRequest.Builder(
            com.google.android.gms.location.Priority.PRIORITY_HIGH_ACCURACY,
            15_000L // 15 sekundi
        ).build()

        fusedLocationClient.requestLocationUpdates(
            locationRequest,
            object : com.google.android.gms.location.LocationCallback() {
                override fun onLocationResult(result: com.google.android.gms.location.LocationResult) {
                    val location = result.lastLocation ?: return
                    serviceScope.launch {
                        checkNearbyRecords(location)
                    }
                }
            },
            mainLooper
        )
    }

    private fun startCheckingNearbyRecords() {
        startLocationUpdates()
    }


    private suspend fun checkNearbyRecords(location: Location) {
        val nearbyRecords = repository.getNearbyRecords(
            location.latitude,
            location.longitude,
            radiusMeters,
            excludeUserId = currentUserId
        )

        val newRecords = nearbyRecords.filter { it.id !in notifiedRecords }

        newRecords.forEach { record ->
            showNotification(
                "Blizu si rekorda!",
                "U blizini se nalazi ${record.title}"
            )
            notifiedRecords.add(record.id)
        }
    }

    private fun showNotification(title: String, message: String) {

        //Log.d("NearbyService", "Sending notification for ${title}")

        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, notificationChannelId)
            .setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(R.drawable.strongify_logo)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(System.currentTimeMillis().toInt(), notification)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                notificationChannelId,
                "Nearby Records",
                NotificationManager.IMPORTANCE_HIGH
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}

@SuppressLint("MissingPermission")
suspend fun FusedLocationProviderClient.awaitSafe(): Location? =
    suspendCancellableCoroutine { cont ->
        this.lastLocation
            .addOnSuccessListener { location ->
                if (location != null) cont.resume(location)
                else cont.resume(null)
            }
            .addOnFailureListener {
                cont.resume(null)
            }
    }