package com.example.strongify.data.repository

import com.example.strongify.data.model.User
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.Query

class LeaderboardRepository {

    private val db = FirebaseFirestore.getInstance()
    private val stats = db.collection("users")
    private var topTenListener: ListenerRegistration? = null

    fun observeTopTen(onDone: (List<User>) -> Unit) {
        topTenListener?.remove()

        topTenListener = stats
            .orderBy("totalPoints", Query.Direction.DESCENDING)
            .limit(10)
            .addSnapshotListener { snapshot, error ->
                if (error != null) return@addSnapshotListener

                val topTen = snapshot?.documents?.mapNotNull { doc ->
                    doc.toObject(User::class.java)
                } ?: emptyList()

                onDone(topTen)
            }
    }

    fun stopObservingTopTen() {
        topTenListener?.remove()
        topTenListener = null
    }
}
