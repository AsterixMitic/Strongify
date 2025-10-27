import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog',
  imports: [CommonModule],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss'
})
export class Dialog {
  @Input() question = '';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() isOpen = signal(false);
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
    this.close();
  }

  onCancel() {
    this.cancel.emit();
    this.close();
  }

  close() {
    this.isOpen.set(false);
  }

  open() {
    this.isOpen.set(true);
  }

  toggle() {
    this.isOpen.set(!this.isOpen());
  }
}