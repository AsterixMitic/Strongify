import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutRecordDto } from '../../feature/workout-record/data/workout-record.dto';

@Component({
  selector: 'app-record-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './record-modal.html',
  styleUrls: ['./record-modal.scss']
})
export class RecordModal {
  @Input() record: WorkoutRecordDto | null = null;
  @Input() rank: number | null = null;
  @Output() close = new EventEmitter<void>();

  isOpen = signal(false);

  open() {
    this.isOpen.set(true);
  }

  closeModal() {
    this.isOpen.set(false);
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

