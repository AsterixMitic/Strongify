import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { RecordNotificationDialogComponent, RecordNotificationData } from '../../shared/record-notification-dialog/record-notification-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  showSuccess(message: string, duration: number = 4000) {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['notification-success']
    });
  }

  showInfo(message: string, duration: number = 4000) {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['notification-info']
    });
  }

  showWarning(message: string, duration: number = 4000) {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['notification-warning']
    });
  }

  showError(message: string, duration: number = 5000) {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['notification-error']
    });
  }

  showRecordCreatedDialog(data: RecordNotificationData) {
    this.dialog.open(RecordNotificationDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data,
      autoFocus: false,
      restoreFocus: false,
      panelClass: 'record-notification-dialog-panel'
    });
  }
}

