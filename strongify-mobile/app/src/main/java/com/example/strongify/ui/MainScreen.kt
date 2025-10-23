package com.example.strongify.ui

import ProfileViewModel
import RecordsScreen
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.FormatListBulleted
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
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
import com.example.strongify.ui.viewmodel.RecordsViewModel

sealed class MainRoute(val route: String) {
    object Home : MainRoute("home")
    object Profile : MainRoute("profile")
    object Leaderboard : MainRoute("leaderboard")

    object Records : MainRoute("records")
}

@Composable
fun MainScreen(
    authViewModel: AuthViewModel,
    homeViewModel: HomeViewModel,
    profileViewModel: ProfileViewModel,
    leaderboardViewModel: LeaderboardViewModel,
    recordsViewModel: RecordsViewModel,
    onLogout: () -> Unit
) {
    val navController = rememberNavController()

    Scaffold(
        bottomBar = {

            NavigationBar(
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary
            ) {
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
                    onClick = { navController.navigate(MainRoute.Records.route) },
                    label = { Text("Records") },
                    icon = { Icon(Icons.AutoMirrored.Filled.FormatListBulleted, contentDescription = null) }
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
            composable(MainRoute.Records.route) {
                RecordsScreen(viewModel = recordsViewModel)
            }
        }
    }
}
