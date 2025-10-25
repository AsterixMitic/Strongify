@file:OptIn(ExperimentalMaterial3Api::class)

package com.example.strongify.ui.home

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.os.Looper
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.example.strongify.data.model.GymRecord
import com.example.strongify.ui.viewmodel.HomeViewModel
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.firebase.Firebase
import com.google.firebase.auth.auth
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.MapProperties
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.rememberCameraPositionState
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("MissingPermission", "ViewModelConstructorInComposable")
@Composable
fun HomeScreen(viewModel: HomeViewModel) {
    val context = LocalContext.current
    val records by viewModel.records.collectAsState()
    val currentUserId: String? = Firebase.auth.currentUser?.uid
    var currentLatLng by rememberSaveable { mutableStateOf(LatLng(43.32472, 21.90333)) }

    var showFilterDialog by remember { mutableStateOf(false) }

    var hasPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context, Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val fusedClient = remember { LocationServices.getFusedLocationProviderClient(context) }
    val locationRequest = remember {
        LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000)
            .setWaitForAccurateLocation(true)
            .setMinUpdateIntervalMillis(2000)
            .build()
    }

    val locationLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        hasPermission = granted
        if (!granted)
            Toast.makeText(context, "Dozvola za lokaciju nije odobrena", Toast.LENGTH_SHORT).show()
    }

    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(currentLatLng, 15f)
    }
    val coroutineScope = rememberCoroutineScope()
    val isInitialPosition = remember { mutableStateOf(true) }

    DisposableEffect(hasPermission) {
        if (hasPermission) {
            val callback = object : LocationCallback() {
                override fun onLocationResult(result: LocationResult) {
                    val newLocation = result.lastLocation ?: return
                    val newLatLng = LatLng(newLocation.latitude, newLocation.longitude)
                    currentLatLng = newLatLng

                    if (isInitialPosition.value) {
                        coroutineScope.launch {
                            cameraPositionState.animate(
                                CameraUpdateFactory.newLatLngZoom(newLatLng, 15f),
                                1000
                            )
                            isInitialPosition.value = false
                        }
                    }
                }
            }

            fusedClient.requestLocationUpdates(locationRequest, callback, Looper.getMainLooper())
            onDispose { fusedClient.removeLocationUpdates(callback) }
        } else {
            locationLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
            onDispose { }
        }
    }

    var showDialog by remember { mutableStateOf(false) }

    var selectedRecord by remember { mutableStateOf<GymRecord?>(null) }
    var selectedUsername by remember { mutableStateOf("") }
    var selectedUserImage by remember { mutableStateOf<String?>(null) }
    if (selectedRecord != null) {
        RecordDetailsBottomSheet(
            homeViewModel = viewModel,
            context = context,
            record = selectedRecord!!,
            username = selectedUsername,
            userImageUrl = selectedUserImage,
            onDismiss = { selectedRecord = null },
            onChallengeClick = { record ->

            }
        )
    }

    Scaffold() { innerPadding ->
        Box(Modifier.fillMaxSize().padding(innerPadding)) {
            GoogleMap(
                modifier = Modifier.fillMaxSize(),
                cameraPositionState = cameraPositionState,
                properties = MapProperties(isMyLocationEnabled = hasPermission)
            ) {
                records.forEach { record ->
                    Marker(
                        state = MarkerState(LatLng(record.latitude, record.longitude)),
                        title = record.title,
                        snippet = record.id,
                        onClick = {
                            selectedRecord = record
                            viewModel.getUserById(record.userId) { user ->
                                selectedUsername = user?.username ?: "Nepoznat korisnik"
                                selectedUserImage = user?.profileImageUrl
                            }
                            false
                        },
                        icon = BitmapDescriptorFactory.defaultMarker(getMarkerColor(record.exerciseType))
                    )
                }
            }

            FloatingActionButton(
                onClick = { showFilterDialog = true },
                containerColor = if (!showFilterDialog) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onPrimary,
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(16.dp, 100.dp),
            ) {
                Icon(Icons.Default.Search, contentDescription = "Filtriraj")
            }

            if (showFilterDialog) {
                RecordFilterDialog(
                    userLocation = currentLatLng,
                    onDismiss = { showFilterDialog = false },
                    onApplyFilter = { radius, type ->
                        viewModel.filterRecords(radius, type, currentLatLng)
                        showFilterDialog = false
                    },
                    onResetFilters = {
                        viewModel.resetFilters()
                        showFilterDialog = false
                    }
                )
            }

            FloatingActionButton(
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary,
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(16.dp),
                onClick = { showDialog = true }
            ) {
                Icon(Icons.Default.Add,
                    contentDescription = "Dodaj rekord")
            }

            if (showDialog) {
                AddRecordDialog(
                    homeViewModel = viewModel,
                    context = context,
                    onDismiss = { showDialog = false },
                    onSave = { title, description, type, rpe, sets, reps, duration, weight, distance, imageUri ->
                        val record = GymRecord(
                            title = title,
                            description = description,
                            exerciseType = type,
                            rpe = rpe,
                            sets = sets,
                            reps = reps,
                            duration = duration,
                            weight = weight,
                            distance = distance,
                            latitude = currentLatLng.latitude,
                            longitude = currentLatLng.longitude,
                            userId = currentUserId!!,
                        )
                        viewModel.addRecord(record, imageUri, context)
                        showDialog = false
                    }
                )
            }
        }
    }
}

//TODO: Custom markeri za svaki tip posebno
fun getMarkerColor(exerciseType: String): Float {
    return when (exerciseType.lowercase()) {
        "powerlifting" -> BitmapDescriptorFactory.HUE_RED
        "bodybuilding" -> BitmapDescriptorFactory.HUE_ORANGE
        "calisthenics" -> BitmapDescriptorFactory.HUE_AZURE
        "cardio" -> BitmapDescriptorFactory.HUE_GREEN
        else -> BitmapDescriptorFactory.HUE_VIOLET
    }
}

