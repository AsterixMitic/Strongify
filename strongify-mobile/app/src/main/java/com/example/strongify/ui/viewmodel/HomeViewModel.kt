package com.example.strongify.ui.viewmodel

import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.strongify.data.model.GymRecord
import com.example.strongify.data.model.User
import com.example.strongify.data.repository.CloudinaryStorageRepository
import com.example.strongify.data.repository.GymRepository
import com.example.strongify.data.repository.UserRepository
import com.google.android.gms.maps.model.LatLng
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class HomeViewModel(
    private val repo: GymRepository = GymRepository(),
    private val cloudinaryRepo: CloudinaryStorageRepository = CloudinaryStorageRepository()
) : ViewModel() {

    private val _records = MutableStateFlow<List<GymRecord>>(emptyList())
    val records: StateFlow<List<GymRecord>> = _records

    init {
        repo.getRecordsRealtime { updatedList ->
            _records.value = updatedList
        }
    }

    fun addRecord(record: GymRecord) {
        viewModelScope.launch {
            repo.addRecord(record)
        }
    }

    fun addRecord(
        record: GymRecord,
        imageUri: Uri?,
        context: Context
    ) {
        viewModelScope.launch {
            try {
                val scoredRecord = record.copy(score = calculateScore(record))
                val docRef = repo.addRecordAndReturnRef(scoredRecord)
                val recordId = docRef.id

                var imageUrl: String? = null
                if (imageUri != null) {
                    imageUrl = cloudinaryRepo.uploadMarkerImage(imageUri, context)
                    repo.updateRecordImage(recordId, imageUrl)
                }

                _records.value = _records.value + scoredRecord.copy(id = recordId, imageUrl = imageUrl)

                repo.updateUserScore( scoredRecord.score)

                _uploadState.value = UploadState.Success(imageUrl ?: "")
                Log.d("SLIKA", "${imageUrl}");
            } catch (e: Exception) {
                _uploadState.value = UploadState.Error(e.message ?: "Greška prilikom dodavanja rekorda")
            }
        }
    }

    private fun calculateScore(record: GymRecord): Int {
        return when (record.exerciseType) {
            "Powerlifting", "Bodybuilding"-> {
                (record.weight!! * record.reps!! * record.sets!!).toInt()
            }
            "Cardio" -> {
                (record.distance!! * 100).toInt()
            }
            else -> {
                (record.reps!! * 20).toInt()
            }
        }
    }

    private val _uploadState = MutableStateFlow<UploadState>(UploadState.Idle)
    val uploadState: StateFlow<UploadState> = _uploadState

    fun uploadRecordImage(uri: Uri, context: Context, recordId: String, userId: String) {
        viewModelScope.launch {
            try {
                _uploadState.value = UploadState.Loading
                val imageUrl = cloudinaryRepo.uploadMarkerImage(uri, context)

                repo.updateRecordImage(recordId, imageUrl)

                val bonusPoints = 50
                repo.updateUserScore( bonusPoints)

                _uploadState.value = UploadState.Success(imageUrl)

            } catch (e: Exception) {
                _uploadState.value = UploadState.Error(e.message ?: "Greška prilikom slanja slike")
            }
        }
    }

    fun filterRecords(radius: Int?, exerciseType: String?, userLocation: LatLng?) {
        val allRecords = _records.value

        val filtered = allRecords.filter { record ->
            var matches = true

            if (exerciseType != null) {
                matches = matches && record.exerciseType.equals(exerciseType, ignoreCase = true)
            }

            if (radius != null && userLocation != null) {
                val distance = FloatArray(1)
                android.location.Location.distanceBetween(
                    userLocation.latitude,
                    userLocation.longitude,
                    record.latitude,
                    record.longitude,
                    distance
                )
                matches = matches && distance[0] <= radius
            }

            matches
        }

        _records.value = filtered
    }

    fun resetFilters() {
        repo.getRecordsRealtime { updatedList ->
            _records.value = updatedList
        }
    }

    private val userRepo = UserRepository()

    fun getUserById(userId: String, onResult: (User?) -> Unit) {
        viewModelScope.launch {
            try {
                val user = userRepo.getUserById(userId)
                onResult(user)
            } catch (e: Exception) {
                onResult(null)
            }
        }
    }
    sealed class UploadState {
        object Idle : UploadState()
        object Loading : UploadState()
        data class Success(val url: String) : UploadState()
        data class Error(val message: String) : UploadState()
    }

}
