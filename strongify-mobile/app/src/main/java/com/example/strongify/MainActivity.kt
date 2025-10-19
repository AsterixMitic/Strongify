package com.example.strongify

import android.annotation.SuppressLint
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.example.strongify.ui.StrongifyNavGraph
import com.example.strongify.ui.viewmodel.AuthViewModel
import com.example.strongify.ui.viewmodel.HomeViewModel

class MainActivity : ComponentActivity() {
    @SuppressLint("ViewModelConstructorInComposable")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val authViewModel = AuthViewModel()
            val homeViewModel = HomeViewModel()

            val startDestination = if (authViewModel.isUserLoggedIn()) {
                authViewModel.loadUser()
                "main"
            } else {
                "login"
            }

            StrongifyNavGraph(
                authViewModel = authViewModel,
                homeViewModel = homeViewModel,
                startDestination = startDestination
            )
        }
    }
}
