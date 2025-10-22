@file:OptIn(ExperimentalMaterial3Api::class)

package com.example.strongify.ui.home

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.os.Looper
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
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

    var currentLatLng by rememberSaveable { mutableStateOf(LatLng(43.32472, 21.90333)) }

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
    DisposableEffect(hasPermission) {
        if (hasPermission) {
            val callback = object : LocationCallback() {
                override fun onLocationResult(result: LocationResult) {
                    val newLocation = result.lastLocation ?: return
                    val newLatLng = LatLng(newLocation.latitude, newLocation.longitude)
                    currentLatLng = newLatLng

                    coroutineScope.launch {
                        cameraPositionState.animate(
                            CameraUpdateFactory.newLatLngZoom(newLatLng, 15f),
                            1000
                        )
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
                        snippet = "${record.exerciseType}: ${record.description}"
                    )
                }
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
                    onDismiss = { showDialog = false },
                    onSave = { title, desc, type ->
                        val record = GymRecord(
                            title = title,
                            description = desc,
                            latitude = currentLatLng.latitude,
                            longitude = currentLatLng.longitude,
                            exerciseType = type
                        )
                        viewModel.addRecord(record)
                        showDialog = false
                    }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddRecordDialog(onDismiss: () -> Unit, onSave: (String, String, String) -> Unit) {
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var selectedType by remember { mutableStateOf("Powerlifting") }

    val exerciseTypes = listOf("Powerlifting", "Calisthenics", "Bodybuilding", "Cardio")

    AlertDialog(
        containerColor = MaterialTheme.colorScheme.surface,
        onDismissRequest = onDismiss,
        confirmButton = { TextButton(onClick = { onSave(title, description, selectedType) }) { Text("Sačuvaj") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Otkaži") } },
        title = { Text("Dodaj novi rekord") },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = title,

                    onValueChange = { title = it }, label = { Text("Naziv vežbe") })
                OutlinedTextField(value = description, onValueChange = { description = it }, label = { Text("Opis") })
                DropdownMenuBox(selectedType, exerciseTypes) { selectedType = it }
            }
        }
    )
}

@Composable
fun DropdownMenuBox(selectedType: String, types: List<String>, onSelect: (String) -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    ExposedDropdownMenuBox(

        expanded = expanded, onExpandedChange = { expanded = !expanded }
    )
    {
        OutlinedTextField(
            value = selectedType,
            onValueChange = {},
            label = { Text("Tip vežbe") },
            readOnly = true,
            modifier = Modifier.menuAnchor()
        )
        DropdownMenu(
            containerColor = MaterialTheme.colorScheme.surface,
            expanded = expanded, onDismissRequest = { expanded = false }
        ) {
            types.forEach {
                DropdownMenuItem(

                    text = { Text(it) }, onClick = {
                    onSelect(it)
                    expanded = false
                })
            }
        }
    }
}
