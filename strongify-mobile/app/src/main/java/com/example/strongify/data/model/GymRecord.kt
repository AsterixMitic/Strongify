package com.example.strongify.data.model

data class GymRecord(
    val id: String = "",
    val userId: String = "",
    val title: String = "",
    val description: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val timestamp: Long = System.currentTimeMillis(),
    val score: Int = 0,
    val exerciseType: String = "",
    val imageUrl: String? = null,
    val rpe: Int = 0,
    val sets: Int = 0,
    val reps: Int = 0
)
