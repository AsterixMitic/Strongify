package com.example.strongify.data.repository

import com.example.strongify.data.model.User
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.tasks.await
import java.util.UUID

class UserRepository {

    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()
    private val storage = FirebaseStorage.getInstance().reference
    private val usersCollection = db.collection("users")

    suspend fun getCurrentUser(): User? {
        val uid = auth.currentUser?.uid ?: return null
        val snapshot = usersCollection.document(uid).get().await()
        return snapshot.toObject(User::class.java)
    }

    suspend fun uploadProfileImage(imageBytes: ByteArray): String {
        val uid = auth.currentUser?.uid ?: return ""
        val imageRef = storage.child("profile_images/${uid}_${UUID.randomUUID()}.jpg")
        imageRef.putBytes(imageBytes).await()
        return imageRef.downloadUrl.await().toString()
    }

    suspend fun updateProfileImageUrl(url: String) {
        val uid = auth.currentUser?.uid ?: return
        usersCollection.document(uid).update("profileImageUrl", url).await()
    }

    fun signOut() {
        auth.signOut()
    }
}
