
import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.strongify.data.repository.CloudinaryStorageRepository
import com.example.strongify.data.repository.UserRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ProfileViewModel(
    private val cloudinaryRepo: CloudinaryStorageRepository = CloudinaryStorageRepository(),
    private val userRepository: UserRepository = UserRepository()
) : ViewModel() {

    private val _uploadState = MutableStateFlow<UploadState>(UploadState.Idle)
    val uploadState: StateFlow<UploadState> = _uploadState

    fun uploadProfileImage(uri: Uri, context: Context, userId: String) {
        viewModelScope.launch {
            try {
                _uploadState.value = UploadState.Loading
                val imageUrl = cloudinaryRepo.uploadProfileImage(uri, context)
                Log.e("URI", imageUrl)
                userRepository.updateUserProfileImage(userId, imageUrl)
                _uploadState.value = UploadState.Success(imageUrl)
            } catch (e: Exception) {
                _uploadState.value = UploadState.Error(e.message ?: "Greška prilikom slanja slike")
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
