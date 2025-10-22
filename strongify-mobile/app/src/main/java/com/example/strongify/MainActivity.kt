package com.example.strongify

import ProfileViewModel
import android.annotation.SuppressLint
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.example.strongify.ui.StrongifyNavGraph
import com.example.strongify.ui.theme.StrongifyTheme
import com.example.strongify.ui.viewmodel.AuthViewModel
import com.example.strongify.ui.viewmodel.HomeViewModel
import com.example.strongify.ui.viewmodel.LeaderboardViewModel

class MainActivity : ComponentActivity() {
    @SuppressLint("ViewModelConstructorInComposable")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            StrongifyTheme {
                val authViewModel = AuthViewModel()
                val homeViewModel = HomeViewModel()
                val profileViewModel = ProfileViewModel()
                val leaderboardViewModel = LeaderboardViewModel()

                val startDestination = if (authViewModel.isUserLoggedIn()) {
                    authViewModel.loadUser()
                    "main"
                } else {
                    "login"
                }

                StrongifyNavGraph(
                    authViewModel = authViewModel,
                    homeViewModel = homeViewModel,
                    profileViewModel = profileViewModel,
                    leaderboardViewModel = leaderboardViewModel,
                    startDestination = startDestination
                )
            }
        }
    }
}
