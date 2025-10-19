package com.example.strongify.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.strongify.data.repository.GymRepository
import com.example.strongify.data.model.GymRecord
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class HomeViewModel(private val repo: GymRepository = GymRepository()) : ViewModel() {

    private val _records = MutableStateFlow<List<GymRecord>>(emptyList())
    val records: StateFlow<List<GymRecord>> = _records

    init {
        repo.getRecordsRealtime { updatedList ->
            _records.value = updatedList
        }
    }

    fun addRecord(record: GymRecord) {
        viewModelScope.launch {
            repo.addRecord(record)
        }
    }
}
