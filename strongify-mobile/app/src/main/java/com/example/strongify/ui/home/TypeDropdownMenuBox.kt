package com.example.strongify.ui.home

import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier

val exerciseTypes = listOf("Powerlifting", "Calisthenics", "Bodybuilding", "Cardio")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DropdownMenuBox(selectedType: String, onSelect: (String) -> Unit)
{ var expanded by remember { mutableStateOf(false) }

    ExposedDropdownMenuBox( expanded = expanded, onExpandedChange = { expanded = !expanded } )
    {
        OutlinedTextField(
            value = selectedType,
            onValueChange = {},
            label = { Text("Tip vežbe")
            }, readOnly = true, modifier = Modifier.menuAnchor() )
        DropdownMenu(
            containerColor = MaterialTheme.colorScheme.surface,
            expanded = expanded,
            onDismissRequest = { expanded = false } )
        { exerciseTypes.forEach {
            DropdownMenuItem(
                text = { Text(it) },
                onClick = {
                    onSelect(it)
                    expanded = false
                })
        } } } }