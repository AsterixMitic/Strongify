package com.example.strongify.ui.home

import android.content.Context
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.rememberAsyncImagePainter
import com.example.strongify.data.model.GymRecord
import com.example.strongify.ui.viewmodel.HomeViewModel
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RecordDetailsBottomSheet(
    homeViewModel: HomeViewModel,
    context: Context,
    record: GymRecord,
    username: String,
    userImageUrl: String?,
    onDismiss: () -> Unit,
    onChallengeClick: (GymRecord) -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val scope = rememberCoroutineScope()
    val currentUserId = FirebaseAuth.getInstance().currentUser?.uid

    var imageUri by remember { mutableStateOf<Uri?>(null) }
    val uploadState by homeViewModel.uploadState.collectAsState()

    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            imageUri = it
            homeViewModel.uploadRecordImage(it, context, record.id, currentUserId!!)
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (userImageUrl != null) {
                        Image(
                            painter = rememberAsyncImagePainter(userImageUrl),
                            contentDescription = "User image",
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape),
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        Surface(
                            modifier = Modifier.size(48.dp),
                            shape = CircleShape,
                            color = MaterialTheme.colorScheme.secondaryContainer
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(
                                    username.firstOrNull()?.uppercase() ?: "?",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(username, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text(record.exerciseType, style = MaterialTheme.typography.labelSmall)
                    }
                }

                IconButton(onClick = {
                    scope.launch { sheetState.hide() }
                    onDismiss()
                }) {
                    Icon(Icons.Default.Close, contentDescription = "Zatvori")
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            record.imageUrl?.let {
                Image(
                    painter = rememberAsyncImagePainter(it),
                    contentDescription = record.title,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .clip(RoundedCornerShape(16.dp)),
                    contentScale = ContentScale.Crop
                )
                Spacer(modifier = Modifier.height(12.dp))
            }

            Text(record.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text(record.description, style = MaterialTheme.typography.bodyMedium)
            Spacer(modifier = Modifier.height(12.dp))

            Surface(
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.surfaceVariant,
                tonalElevation = 2.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    record.sets?.let { if (it > 0) Text("Setova: ${record.sets}") }
                    record.reps?.let { if (it > 0) Text("Ponavljanja: ${record.reps}") }
                    record.rpe?.let { if (it > 0) Text("RPE: ${record.rpe}") }
                    Text("Rezultat: ${record.score} poena")
                    Text("Vreme: ${java.text.SimpleDateFormat("dd.MM.yyyy").format(record.timestamp)}")
                }
            }

            // Rekord slika
            val painter = rememberAsyncImagePainter(record.imageUrl ?: imageUri)
            Image(
                painter = painter,
                contentDescription = "Slika rekorda",
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp),
                contentScale = ContentScale.Crop
            )

            Spacer(modifier = Modifier.height(8.dp))

            if (record.userId == currentUserId && record.imageUrl.isNullOrEmpty()) {
                Button(
                    onClick = { galleryLauncher.launch("image/*") },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Dodaj sliku i osvoji poene")
                }

                if (uploadState is HomeViewModel.UploadState.Loading) {
                    LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
                }
                if (uploadState is HomeViewModel.UploadState.Success) {
                    Text(
                        "Slika uspešno dodata! Bonus poeni dodeljeni.",
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                if (uploadState is HomeViewModel.UploadState.Error) {
                    Text(
                        (uploadState as HomeViewModel.UploadState.Error).message,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            if (record.userId != currentUserId) {
                Button(
                    onClick = { onChallengeClick(record) },
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Pokušaj da oboriš rekord 🏋️")
                }
            } else {
                Text("Ovo je tvoj rekord 🥇", color = MaterialTheme.colorScheme.primary)
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
