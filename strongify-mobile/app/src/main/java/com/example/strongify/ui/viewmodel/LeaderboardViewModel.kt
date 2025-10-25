package com.example.strongify.ui.viewmodel

import androidx.lifecycle.ViewModel
import com.example.strongify.data.model.User
import com.example.strongify.data.repository.LeaderboardRepository
import com.example.strongify.data.repository.UserRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

@HiltViewModel
class LeaderboardViewModel @Inject constructor(
    private val userRepository: UserRepository = UserRepository(),
    private val repository: LeaderboardRepository = LeaderboardRepository()
) : ViewModel() {

    private val _topTen = MutableStateFlow<List<User>>(emptyList())
    val topTen: StateFlow<List<User>> = _topTen

    fun startListening() {
        repository.observeTopTen { list ->
            _topTen.value = list
        }
    }

    fun stopListening() {
        repository.stopObservingTopTen()
    }

    override fun onCleared() {
        super.onCleared()
        stopListening()
    }
}

annotation class Inject

annotation class HiltViewModel
