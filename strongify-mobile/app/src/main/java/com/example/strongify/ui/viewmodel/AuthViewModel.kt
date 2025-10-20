package com.example.strongify.ui.viewmodel

import android.util.Patterns
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.strongify.data.model.User
import com.example.strongify.data.repository.AuthRepository
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class AuthResult {
    object Success : AuthResult()
    data class Error(val message: String) : AuthResult()
    object Loading : AuthResult()
}

class AuthViewModel(private val repo: AuthRepository = AuthRepository()) : ViewModel() {

    private val _authState = MutableStateFlow<AuthResult?>(null)
    val authState: StateFlow<AuthResult?> = _authState


    private val _validationError = MutableStateFlow<String?>(null)
    val validationError: StateFlow<String?> = _validationError


    fun register(
        email: String,
        password: String,
        username: String,
        name: String,
        lastName: String,
        phone: String,
        imageBytes: ByteArray?
    ) {
        val error = validateRegistration(email, password, username, name, lastName, phone)
        if (error != null) {
            _authState.value = AuthResult.Error(error)
            return
        }

        viewModelScope.launch {
            _authState.value = AuthResult.Loading
            val result = repo.registerUser(email, password, username, name, lastName, phone, imageBytes)
            _authState.value = result.exceptionOrNull()?.let { AuthResult.Error(it.message ?: "Greška") } ?: AuthResult.Success
        }
    }

    fun login(email: String, password: String) {

        val error = validateLogin(email, password)
        if (error != null) {
            _authState.value = AuthResult.Error(error)
            return
        }

        viewModelScope.launch {
            _authState.value = AuthResult.Loading
            val result = repo.loginUser(email, password)
            _authState.value = result.exceptionOrNull()?.let { AuthResult.Error(it.message ?: "Greška") } ?: AuthResult.Success
        }
    }
    fun validateRegistrationFields(
        email: String,
        password: String,
        username: String,
        name: String,
        lastName: String,
        phone: String
    ): Boolean {
        val error = validateRegistration(email, password, username, name, lastName, phone)
        _validationError.value = error
        return error == null
    }

    private fun validateRegistration(
        email: String,
        password: String,
        username: String,
        name: String,
        lastName: String,
        phone: String
    ): String? {
        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) return "Nevažeći email"
        if (password.length < 6) return "Lozinka mora imati najmanje 6 karaktera"
        if (username.isBlank()) return "Korisničko ime ne sme biti prazno"
        if (name.isBlank()) return "Ime ne sme biti prazno"
        if (lastName.isBlank()) return "Prezime ne sme biti prazno"
        if (phone.isBlank()) return "Broj telefona ne sme biti prazan"
        if (!phone.all { it.isDigit() }) return "Broj telefona mora sadržati samo cifre"
        return null
    }

    fun validateLoginFields(
        email: String,
        password: String
    ): Boolean {
        val error = validateLogin(email, password)
        _validationError.value = error
        return error == null
    }
    private fun validateLogin(email: String, password: String): String? {
        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) return "Nevažeći email"
        if (password.isBlank()) return "Lozinka ne sme biti prazna"
        return null
    }
    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user

    fun loadUser() {
        viewModelScope.launch {
            val user = repo.getCurrentUserData()

            _user.value = user
        }
    }

    fun updateProfileImage(imageBytes: ByteArray) {
        viewModelScope.launch {
            _authState.value = AuthResult.Loading
            val result = repo.updateProfileImage(imageBytes)
            result.onSuccess { newUrl ->
                _user.value = _user.value?.copy(profileImageUrl = newUrl)
                _authState.value = AuthResult.Success
            }.onFailure { e ->
                _authState.value = AuthResult.Error(e.message ?: "Greška pri ažuriranju slike")
            }
        }
    }
    fun logout() {
        repo.logout()
        _user.value = null
        _authState.value = null
    }

    fun isUserLoggedIn(): Boolean {
        return FirebaseAuth.getInstance().currentUser != null
    }

}
