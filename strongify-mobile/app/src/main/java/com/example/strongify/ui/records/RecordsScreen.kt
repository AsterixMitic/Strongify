
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.rememberAsyncImagePainter
import com.example.strongify.data.model.GymRecord
import com.example.strongify.ui.viewmodel.RecordsViewModel

@Composable
fun RecordsScreen(viewModel: RecordsViewModel) {
    val records by viewModel.filteredRecords.collectAsState()
    val selectedRecord by viewModel.selectedRecord.collectAsState()

    var selectedType by remember { mutableStateOf<String?>(null) }
    var selectedTitle by remember { mutableStateOf<String?>(null) }

        Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
            Text(
                "Rekordi",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )

            Spacer(Modifier.height(8.dp))

            FilterSection(
                selectedType = selectedType,
                onTypeChange = {
                    selectedType = it
                    viewModel.filterByType(it)
                },
                selectedTitle = selectedTitle,
                onTitleChange = {
                    selectedTitle = it
                    viewModel.filterByTitle(it)
                }
            )

            Spacer(Modifier.height(16.dp))

            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(records) { record ->
                    RecordItem(record) { viewModel.onRecordClick(record) }
                }
            }
        }
}

@Composable
fun FilterSection(
    selectedType: String?,
    onTypeChange: (String?) -> Unit,
    selectedTitle: String?,
    onTitleChange: (String?) -> Unit
) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        var expandedType by remember { mutableStateOf(false) }

        Box {
            OutlinedButton(onClick = { expandedType = true }) {
                Text(selectedType ?: "Tip vežbe")
            }
            DropdownMenu(
                expanded = expandedType,
                onDismissRequest = { expandedType = false },
                containerColor =  MaterialTheme.colorScheme.surface,
                modifier = Modifier.background(MaterialTheme.colorScheme.surface)
            ) {
                listOf("Powerlifting", "Calisthenics", "Bodybuilding", "Cardio").forEach { type ->
                    DropdownMenuItem(
                        text = { Text(type) },
                        onClick = {
                            expandedType = false
                            onTypeChange(type)
                        },
                    )
                }
                DropdownMenuItem(
                    text = { Text("Svi tipovi") },
                    onClick = {
                        expandedType = false
                        onTypeChange(null)
                    }
                )
            }
        }

        OutlinedTextField(
            value = selectedTitle ?: "",
            onValueChange = onTitleChange,
            label = { Text("Naziv") },
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
fun RecordItem(record: GymRecord, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 4.dp),
        colors = CardDefaults.cardColors(
            MaterialTheme.colorScheme.surface,
            MaterialTheme.colorScheme.primary
        ),
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(12.dp),
        ) {
            if (record.imageUrl != null) {
                Image(
                    painter = rememberAsyncImagePainter(record.imageUrl),
                    contentDescription = record.title,
                    modifier = Modifier.size(64.dp)
                )
                Spacer(Modifier.width(8.dp))
            }

            Column(
                modifier = Modifier.weight(1f),
            ) {
                Text(record.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text("Tip: ${record.exerciseType}", style = MaterialTheme.typography.bodySmall)
                Text("Rezultat: ${record.score}", style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}
