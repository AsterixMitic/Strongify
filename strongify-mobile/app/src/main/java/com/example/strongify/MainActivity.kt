package com.example.strongify

import ProfileViewModel
import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.example.strongify.ui.StrongifyNavGraph
import com.example.strongify.ui.theme.StrongifyTheme
import com.example.strongify.ui.viewmodel.AuthViewModel
import com.example.strongify.ui.viewmodel.HomeViewModel
import com.example.strongify.ui.viewmodel.LeaderboardViewModel
import com.example.strongify.ui.viewmodel.RecordsViewModel

class MainActivity : ComponentActivity() {
    @SuppressLint("ViewModelConstructorInComposable")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        createNotificationChannel()
        setContent {
            StrongifyTheme {
                val authViewModel = AuthViewModel()
                val homeViewModel = HomeViewModel()
                val profileViewModel = ProfileViewModel()
                val leaderboardViewModel = LeaderboardViewModel()
                val recordsViewModel = RecordsViewModel()

                val startDestination = if (authViewModel.isUserLoggedIn()) {
                    authViewModel.loadUser()
                    authViewModel.startNearbyService(this)
                    "main"
                } else {
                    "login"
                }

                StrongifyNavGraph(
                    authViewModel = authViewModel,
                    homeViewModel = homeViewModel,
                    profileViewModel = profileViewModel,
                    leaderboardViewModel = leaderboardViewModel,
                    recordsViewModel = recordsViewModel,
                    startDestination = startDestination
                )
            }
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "strongify_channel",
                "Strongify Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications about nearby users or events"
            }

            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

}
