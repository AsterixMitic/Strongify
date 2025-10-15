package com.example.strongify

import android.annotation.SuppressLint
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.example.strongify.ui.StrongifyNavGraph
import com.example.strongify.ui.viewmodel.AuthViewModel

class MainActivity : ComponentActivity() {
    @SuppressLint("ViewModelConstructorInComposable")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val viewModel = AuthViewModel()
            StrongifyNavGraph(viewModel = viewModel)
        }
    }
}