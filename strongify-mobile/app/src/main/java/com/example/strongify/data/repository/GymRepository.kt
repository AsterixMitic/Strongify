package com.example.strongify.data.repository

import com.example.strongify.data.model.GymRecord
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

class GymRepository {

    private val db = FirebaseFirestore.getInstance()
    private val collection = db.collection("gym_records")

    suspend fun addRecord(record: GymRecord) {
        val docRef = collection.document()
        record.copy(id = docRef.id)
        docRef.set(record).await()
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
