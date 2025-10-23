package com.example.strongify.data.repository

import com.example.strongify.data.MarkerRepository
import com.example.strongify.data.model.GymRecord
import com.google.firebase.Firebase
import com.google.firebase.auth.auth
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

    }

    fun getRecordsRealtime(onUpdate: (List<GymRecord>) -> Unit) {
        collection.addSnapshotListener { snapshot, _ ->
            if (snapshot != null) {
                val records = snapshot.toObjects(GymRecord::class.java)
                onUpdate(records)
            }
        }
    }
}
