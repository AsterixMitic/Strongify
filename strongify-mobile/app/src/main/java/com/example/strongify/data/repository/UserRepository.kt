package com.example.strongify.data.repository

import com.example.strongify.data.model.User
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

class UserRepository {

    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()
    private val usersCollection = db.collection("users")

    suspend fun getCurrentUser(): User? {
        val uid = auth.currentUser?.uid ?: return null
        val snapshot = usersCollection.document(uid).get().await()
        return snapshot.toObject(User::class.java)
    }

    suspend fun updateProfileImageUrl(url: String) {
        val uid = auth.currentUser?.uid ?: return
        usersCollection.document(uid).update("profileImageUrl", url).await()
    }

    fun signOut() {
        auth.signOut()
    }

    suspend fun updateUserProfileImage(userId: String, imageUrl: String) {
        val userRef = usersCollection.document(userId)
        userRef.update("profileImageUrl", imageUrl)
    }

    suspend fun addPointsToUser(uid: String, points: Int) {
        val userRef = usersCollection.document(uid)
        db.runTransaction { transaction ->
            val snapshot = transaction.get(userRef)
            val currentScore = snapshot.getLong("totalPoints") ?: 0
            transaction.update(userRef, "totalPoints", currentScore + points)
        }.await()
    }

    suspend fun getUserById(userId: String): User? {
        val snapshot = usersCollection.document(userId).get().await()
        return snapshot.toObject(User::class.java)
    }


}
