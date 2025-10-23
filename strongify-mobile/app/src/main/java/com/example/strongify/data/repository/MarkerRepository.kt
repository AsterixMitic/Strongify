package com.example.strongify.data

import com.example.strongify.data.model.GymRecord
import com.firebase.geofire.GeoFireUtils
import com.firebase.geofire.GeoLocation
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

class MarkerRepository (){

    private val firestore = FirebaseFirestore.getInstance()
    private val recordsCollection = firestore.collection("gym_records")

    suspend fun getNearbyRecords(
        latitude: Double,
        longitude: Double,
        radiusMeters: Double,
        excludeUserId: String? = null
    ): List<GymRecord> {
        val center = GeoLocation(latitude, longitude)
        val bounds = GeoFireUtils.getGeoHashQueryBounds(center, radiusMeters)
        val nearbyRecords = mutableListOf<GymRecord>()

        for (b in bounds) {
            val snapshot = recordsCollection
                .orderBy("geoHash")
                .startAt(b.startHash)
                .endAt(b.endHash)
                .get()
                .await()

            for (doc in snapshot.documents) {
                val record = doc.toObject(GymRecord::class.java) ?: continue
                if (excludeUserId != null && record.userId == excludeUserId) continue

                val distance = GeoFireUtils.getDistanceBetween(center, GeoLocation(record.latitude, record.longitude))
                if (distance <= radiusMeters) nearbyRecords.add(record)
            }
        }

        return nearbyRecords
    }

    suspend fun addRecord(record: GymRecord) {
        val geoHash = GeoFireUtils.getGeoHashForLocation(GeoLocation(record.latitude
            , record.longitude))
        val data = mapOf(
            "id" to record.id,
            "userId" to record.userId,
            "title" to record.title,
            "latitude" to record.latitude,
            "longitude" to record.longitude,
            "timestamp" to record.timestamp,
            "score" to record.score,
            "exerciseType" to record.exerciseType,
            "imageUrl" to record.imageUrl,
            "rpe" to record.rpe,
            "sets" to record.sets,
            "reps" to record.reps,
            "duration" to record.duration,
            "weight" to record.weight,
            "distance" to record.distance,
            "geoHash" to geoHash
        )
        recordsCollection.document(record.id).set(data).await()
    }


}
