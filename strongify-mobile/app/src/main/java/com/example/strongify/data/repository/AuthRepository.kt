package com.example.strongify.data.repository

import com.example.strongify.data.model.User
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.tasks.await
import java.util.UUID

class AuthRepository {

    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()
    private val storage = FirebaseStorage.getInstance().reference

    suspend fun registerUser(
        email: String,
        password: String,
        username: String,
        name: String,
        lastName: String,
        phone: String,
        imageBytes: ByteArray?
    ): Result<Unit> {
        return try {
            val result = auth.createUserWithEmailAndPassword(email, password).await()
            val userId = result.user?.uid ?: return Result.failure(Exception("User not created"))

            var imageUrl = ""
            if (imageBytes != null) {
                val ref = storage.child("profile_images/${UUID.randomUUID()}.jpg")
                ref.putBytes(imageBytes).await()
                imageUrl = ref.downloadUrl.await().toString()
            }

            val user = User(
                userId = userId,
                username = username,
                name = name,
                lastName = lastName,
                phone = phone,
                profileImageUrl = imageUrl,
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

    fun getCurrentUserId(): String? = auth.currentUser?.uid
}