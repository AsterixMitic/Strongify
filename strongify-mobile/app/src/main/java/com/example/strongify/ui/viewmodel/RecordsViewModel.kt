package com.example.strongify.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.strongify.data.model.GymRecord
import com.example.strongify.data.repository.GymRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class RecordsViewModel(
    private val repository: GymRepository = GymRepository()
) : ViewModel() {

    private val _records = MutableStateFlow<List<GymRecord>>(emptyList())
    val records: StateFlow<List<GymRecord>> = _records.asStateFlow()

    private val _filteredRecords = MutableStateFlow<List<GymRecord>>(emptyList())
    val filteredRecords: StateFlow<List<GymRecord>> = _filteredRecords.asStateFlow()

    private val _selectedRecord = MutableStateFlow<GymRecord?>(null)
    val selectedRecord: StateFlow<GymRecord?> = _selectedRecord.asStateFlow()

    private var currentFilterType: String? = null
    private var currentTitleFilter: String? = null

    init {
        observeRecords()
    }

    private fun observeRecords() {
        viewModelScope.launch {
            repository.getRecordsRealtime { list ->
                _records.value = list.sortedByDescending { it.timestamp }
                applyFilters()
            }
        }
    }

    fun filterByType(type: String?) {
        currentFilterType = type
        applyFilters()
    }

    fun filterByTitle(userId: String?) {
        currentTitleFilter = userId
        applyFilters()
    }

    private fun applyFilters() {
        var list = _records.value

        currentFilterType?.let { type ->
            if (type.isNotBlank()) {
                list = list.filter { it.exerciseType.equals(type, ignoreCase = true) }
            }
        }

        currentTitleFilter?.let { title ->
            if (title.isNotBlank()) {
                list = list.filter { it.title.startsWith(title, ignoreCase = true) }
            }
        }

        _filteredRecords.value = list
    }

    fun onRecordClick(record: GymRecord) {
        _selectedRecord.value = record
    }

    fun clearSelectedRecord() {
        _selectedRecord.value = null
    }
}
