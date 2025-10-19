package com.example.strongify.ui.profile

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.example.strongify.ui.viewmodel.AuthViewModel
import java.io.InputStream

@Composable
fun ProfileScreen(viewModel: AuthViewModel = viewModel(), onLogout: () -> Unit) {
    val user by viewModel.user.collectAsState()
    val context = LocalContext.current

    var selectedImageBytes by remember { mutableStateOf<ByteArray?>(null) }

    val imagePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent(),
        onResult = { uri ->
            uri?.let {
                val inputStream: InputStream? = context.contentResolver.openInputStream(it)
                val bytes = inputStream?.readBytes()
                if (bytes != null) selectedImageBytes = bytes
            }
        }
    )

    LaunchedEffect(Unit) { viewModel.loadUser() }

    selectedImageBytes?.let { bytes ->
        viewModel.updateProfileImage(bytes)
        selectedImageBytes = null
    }

    user?.let { currentUser ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            AsyncImage(
                model = user?.profileImageUrl ?: "",
                contentDescription = "Profilna slika",
                modifier = Modifier
                    .size(120.dp)
                    .clip(CircleShape)
                    .border(BorderStroke(2.dp, MaterialTheme.colorScheme.primary), CircleShape)
                    .background(MaterialTheme.colorScheme.surfaceVariant),
                contentScale = ContentScale.Crop,
            )

            TextButton(onClick = { imagePicker.launch("image/*") }) {
                Text("Promeni sliku")
            }

            Text("Ime: ${currentUser.name}")
            Text("Prezime: ${currentUser.lastName}")
            Text("Korisničko ime: ${currentUser.username}")
            Text("Email: ${currentUser.email}")

            Spacer(Modifier.height(20.dp))

            Button(onClick = {
                viewModel.logout()
                onLogout()
            }) {
                Text("Odjavi se")
            }
        }
    } ?: run {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
    }
}
