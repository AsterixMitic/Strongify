package com.example.strongify.data.model
data class User(
    val userId: String = "",
    val username: String = "",
    val email: String ="",
    val name: String = "",
    val lastName: String = "",
    val phone: String = "",
    val profileImageUrl: String = "",
    val totalPoints: Int = 0,
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val fcmToken: String = ""
)

