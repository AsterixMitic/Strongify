package com.example.strongify.ui.profile

import ProfileViewModel
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import coil.compose.rememberAsyncImagePainter
import com.example.strongify.ui.viewmodel.AuthViewModel

@Composable
fun ProfileScreen(viewModel: AuthViewModel, profileViewModel: ProfileViewModel, onLogout: () -> Unit) {
    val user by viewModel.user.collectAsState()
    val context = LocalContext.current

    val uploadState by profileViewModel.uploadState.collectAsState()

    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            profileViewModel.uploadProfileImage(it, context, user!!.userId)
        }
    }

    user?.let { currentUser ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {

            val img = user?.profileImageUrl

            when (uploadState) {
                is ProfileViewModel.UploadState.Loading -> CircularProgressIndicator()
                is ProfileViewModel.UploadState.Success -> {
                    val imageUrl = (uploadState as ProfileViewModel.UploadState.Success).url
                    Image(
                        painter = rememberAsyncImagePainter(imageUrl),
                        contentDescription = "Profilna slika",
                        modifier = Modifier
                            .size(128.dp)
                            .clip(CircleShape)
                            .border(2.dp, Color.Gray, CircleShape)
                            .clickable { galleryLauncher.launch("image/*") }
                    )
                }
                is ProfileViewModel.UploadState.Error -> {
                    Text((uploadState as ProfileViewModel.UploadState.Error).message)
                }
                else -> {
                    if(img != ""){
                        AsyncImage(
                            model = user?.profileImageUrl,
                            contentDescription = null,
                            modifier = Modifier.size(120.dp).clip(CircleShape)
                        )
                    } else {
                        Box(
                            modifier = Modifier
                                .size(128.dp)
                                .clip(CircleShape)
                                .background(Color.LightGray)
                                .clickable { galleryLauncher.launch("image/*") },
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Dodaj sliku", color = Color.DarkGray)
                        }
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            TextButton(onClick = { galleryLauncher.launch("image/*") }) {
                Text("Promeni sliku profila")
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
