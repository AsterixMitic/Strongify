package com.example.strongify.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.width
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.google.android.gms.maps.model.LatLng

@Composable
fun RecordFilterDialog(
    userLocation: LatLng?,
    onDismiss: () -> Unit,
    onResetFilters: () -> Unit,
    onApplyFilter: (radius: Int?, exerciseType: String?) -> Unit
) {
    var radius by remember { mutableStateOf(2000f) }
    var enableRadius by remember { mutableStateOf(true) }
    var selectedType by remember { mutableStateOf("Powerlifting") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Filtriraj rekorde") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {

                DropdownMenuBox(selectedType) { selectedType = it }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(
                        checked = enableRadius,
                        onCheckedChange = { enableRadius = it }
                    )
                    Text("Filtriraj po radijusu")
                }

                if (enableRadius) {
                    Text("Radijus: ${radius.toInt()} m")
                    Slider(
                        value = radius,
                        onValueChange = { radius = it },
                        valueRange = 500f..10000f,
                        steps = 9
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("0.5 km")
                        Text("10 km")
                    }

                    if (userLocation == null) {
                        Text(
                            "Nema dostupne lokacije!",
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.labelSmall
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onApplyFilter(if (enableRadius) radius.toInt() else null,
                        if (selectedType.isNotBlank()) selectedType else null)
                },
                enabled = userLocation != null || !enableRadius
            ) {
                Text("Primeni")
            }
        },
        dismissButton = {
            Row {
                TextButton(onClick = onDismiss) {
                    Text("Otkaži")
                }

                Spacer(modifier = Modifier.width(8.dp))

                TextButton(onClick = onResetFilters) {
                    Text("Resetuj", color = Color.Red)
                }
            }
        }
    )
}
