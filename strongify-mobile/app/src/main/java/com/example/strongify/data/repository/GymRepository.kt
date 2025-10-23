package com.example.strongify.data.repository

import com.example.strongify.data.MarkerRepository
import com.example.strongify.data.model.GymRecord
import com.google.firebase.Firebase
import com.google.firebase.auth.auth
import com.google.firebase.firestore.DocumentReference
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

class GymRepository (){

    private val db = FirebaseFirestore.getInstance()
    private val collection = db.collection("gym_records")
    private val repository: MarkerRepository = MarkerRepository()

    private val currentUserId: String? = Firebase.auth.currentUser?.uid

    suspend fun addRecord(record: GymRecord) {

        val docRef = collection.document()
        var newRecord = record.copy(id = docRef.id)
        docRef.set(newRecord).await()
        repository.addRecord(newRecord)

        updateUserScore(record.score)
    }

    fun getRecordsRealtime(onUpdate: (List<GymRecord>) -> Unit) {
        collection.addSnapshotListener { snapshot, _ ->
            if (snapshot != null) {
                val records = snapshot.toObjects(GymRecord::class.java)
                onUpdate(records)
            }
        }
    }

    suspend fun updateRecordImage(id: String, imageUrl: String) {
        val record = collection.document(id)
        record.update("imageUrl", imageUrl)
    }

    suspend fun addRecordAndReturnRef(record: GymRecord): DocumentReference {
        val docRef = collection.document()
        val newRecord = record.copy(id = docRef.id)
        docRef.set(newRecord).await()
        repository.addRecord(newRecord)
        return docRef
    }

    private val usersCollection = db.collection("users")

    suspend fun updateUserScore(scoreToAdd: Int) {
        val userRef = usersCollection.document(currentUserId!!)
        db.runTransaction { transaction ->
            val snapshot = transaction.get(userRef)
            val currentScore = snapshot.getLong("totalPoints") ?: 0L
            transaction.update(userRef, "totalPoints", currentScore + scoreToAdd)
        }.await()
    }

}
