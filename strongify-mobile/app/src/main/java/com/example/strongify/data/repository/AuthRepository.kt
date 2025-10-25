package com.example.strongify.data.repository

import com.example.strongify.data.model.User
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

class AuthRepository {

    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()

    suspend fun registerUser(
        email: String,
        password: String,
        username: String,
        name: String,
        lastName: String,
        phone: String,
    ): Result<Unit> {
        return try {
            val result = auth.createUserWithEmailAndPassword(email, password).await()
            val userId = result.user?.uid ?: return Result.failure(Exception("User not created"))

            val user = User(
                userId = userId,
                username = username,
                email = email,
                name = name,
                lastName = lastName,
                phone = phone,
                profileImageUrl = "https://res.cloudinary.com/dvl4inuer/image/upload/v1761086359/defaullt_profile_ozu3et.png",
                totalPoints = 0
            )

            db.collection("users").document(userId).set(user).await()
            Result.success(Unit)

        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun loginUser(email: String, password: String): Result<Unit> {
        return try {
            auth.signInWithEmailAndPassword(email, password).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCurrentUserData(): User? {
        val userId = auth.currentUser?.uid ?: return null
        val snapshot = db.collection("users").document(userId).get().await()
        return snapshot.toObject(User::class.java)
    }

    fun logout() {
        auth.signOut()
    }
}
