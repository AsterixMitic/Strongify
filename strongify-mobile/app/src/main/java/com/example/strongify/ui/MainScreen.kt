package com.example.strongify.ui

import ProfileViewModel
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.strongify.ui.home.HomeScreen
import com.example.strongify.ui.leaderboard.LeaderboardScreen
import com.example.strongify.ui.profile.ProfileScreen
import com.example.strongify.ui.viewmodel.AuthViewModel
import com.example.strongify.ui.viewmodel.HomeViewModel
import com.example.strongify.ui.viewmodel.LeaderboardViewModel

sealed class MainRoute(val route: String) {
    object Home : MainRoute("home")
    object Profile : MainRoute("profile")
    object Leaderboard : MainRoute("leaderboard")
}

@Composable
fun MainScreen(
    authViewModel: AuthViewModel,
    homeViewModel: HomeViewModel,
    profileViewModel: ProfileViewModel,
    leaderboardViewModel: LeaderboardViewModel,
    onLogout: () -> Unit
) {
    val navController = rememberNavController()

    Scaffold(
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = false,
                    onClick = { navController.navigate(MainRoute.Home.route) },
                    label = { Text("Mapa") },
                    icon = { Icon(Icons.Default.Map, contentDescription = null) }
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { navController.navigate(MainRoute.Leaderboard.route) },
                    label = { Text("Leaderboard") },
                    icon = { Icon(Icons.Default.Star, contentDescription = null) }
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { navController.navigate(MainRoute.Profile.route) },
                    label = { Text("Profil") },
                    icon = { Icon(Icons.Default.Person, contentDescription = null) }
                )
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = MainRoute.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(MainRoute.Home.route) {
                HomeScreen(viewModel = homeViewModel)
            }
            composable(MainRoute.Profile.route) {
                ProfileScreen(viewModel = authViewModel, profileViewModel = profileViewModel, onLogout = onLogout)
            }
            composable(MainRoute.Leaderboard.route) {
                LeaderboardScreen(viewModel = leaderboardViewModel)
            }
        }
    }
}
