package com.example.strongify.data.repository

import android.content.Context
import android.content.pm.PackageManager
import android.net.Uri
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import org.json.JSONObject

class CloudinaryStorageRepository(
)
{

    val cloudNameString: String = "com.example.strongify.cloudinary.CLOUDINARY_CLOUD_NAME"
    val profilePresetString: String = "com.example.strongify.cloudinary.CLOUDINARY_PROFILE_PRESET"
    val markerPresetString: String = "com.example.strongify.cloudinary.CLOUDINARY_MARKER_PRESET"

    private suspend fun uploadImage(
        uri: Uri,
        cloudName: String,
        uploadPreset: String,
        context: Context
    ): String {

            val appInfo = context.packageManager.getApplicationInfo(
            context.packageName,
            PackageManager.GET_META_DATA
        )
        val cloudName = appInfo.metaData?.getString(cloudNameString)
        val uploadPreset = appInfo.metaData?.getString(uploadPreset)

        return withContext(Dispatchers.IO) {
            val client = OkHttpClient()

            val inputStream = context.contentResolver.openInputStream(uri)
                ?: throw IllegalArgumentException("Invalid URI")
            val bytes = inputStream.readBytes()

            val requestBody = MultipartBody.Builder()
                .setType(MultipartBody.Companion.FORM)
                .addFormDataPart(
                    "file", "image.jpg", RequestBody.Companion.create(
                        "image/*".toMediaTypeOrNull(), bytes
                    )
                )
                .addFormDataPart("upload_preset", uploadPreset!!)
                .build()

            val request = Request.Builder()
                .url("https://api.cloudinary.com/v1_1/$cloudName/image/upload")
                .post(requestBody)
                .build()

            val response = client.newCall(request).execute()
            val json = JSONObject(response.body?.string() ?: "{}")
            json.getString("secure_url")
        }
    }

    suspend fun uploadProfileImage(
        uri: Uri,
        context: Context
    ): String {
        return uploadImage(
            uri = uri,
            cloudName = cloudNameString,
            uploadPreset = profilePresetString,
            context = context
        )
    }

    suspend fun uploadMarkerImage(
        uri: Uri,
        context: Context
    ): String {
        return uploadImage(
            uri = uri,
            cloudName = cloudNameString,
            uploadPreset = markerPresetString,
            context = context
        )
    }
}