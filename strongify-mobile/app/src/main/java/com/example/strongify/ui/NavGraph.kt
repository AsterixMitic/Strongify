package com.example.strongify.ui

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.strongify.ui.home.HomeScreen
import com.example.strongify.ui.login.LoginScreen
import com.example.strongify.ui.register.RegisterScreen
import com.example.strongify.ui.viewmodel.AuthViewModel


sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Register : Screen("register")
    object Home : Screen("home")
}

@Composable
fun StrongifyNavGraph(viewModel: AuthViewModel, navController: NavHostController = rememberNavController()) {
    NavHost(navController = navController, startDestination = Screen.Login.route) {

        composable(Screen.Login.route) {
            LoginScreen(
                viewModel = viewModel,
                onLoginSuccess = { navController.navigate(Screen.Home.route) },
                onNavigateToRegister = { navController.navigate(Screen.Register.route) }
            )
        }

        composable(Screen.Register.route) {
            RegisterScreen(
                viewModel = viewModel,
                onRegisterSuccess = { navController.navigate(Screen.Home.route) },
                onNavigateToLogin = { navController.popBackStack(Screen.Login.route, inclusive = false) }
            )
        }

        composable(Screen.Home.route) {
            HomeScreen()
        }
    }
}