import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface RecordNotificationData {
  exerciseName: string;
  locationName?: string;
  reps?: number;
  weightKg?: number;
  durationSec?: number;
  rpe?: number;
  userName?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-record-notification-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="record-notification-dialog">
      <div class="dialog-header">
        <div class="header-content">
          <h1>New Record Set!</h1>
        </div>
        <button mat-icon-button mat-dialog-close class="close-btn">
        </button>
      </div>
      
      <div mat-dialog-content class="dialog-content">
        <div class="record-info">
          <div class="info-row main-info">
            <span class="label">Exercise</span>
            <span class="value exercise-name">{{ data.exerciseName }}</span>
          </div>

          <div class="info-row" *ngIf="data.locationName">
            <span class="label">Location</span>
            <span class="value">
              {{ data.locationName }}
            </span>
          </div>

          <div class="info-row" *ngIf="data.userName">
            <span class="label">User</span>
            <span class="value">
              {{ data.userName }}
            </span>
          </div>

          <div class="metrics">
            <div class="metric-card" *ngIf="data.reps">
              <div class="metric-label">Reps</div>
              <div class="metric-value">{{ data.reps }}</div>
            </div>

            <div class="metric-card" *ngIf="data.weightKg">
              <div class="metric-label">Weight</div>
              <div class="metric-value">{{ data.weightKg }} kg</div>
            </div>

            <div class="metric-card" *ngIf="data.durationSec">
              <div class="metric-label">Duration</div>
              <div class="metric-value">{{ formatDuration(data.durationSec) }}</div>
            </div>

            <div class="metric-card" *ngIf="data.rpe">
              <div class="metric-label">RPE</div>
              <div class="metric-value">{{ data.rpe }}/10</div>
            </div>
          </div>

          <div class="timestamp" *ngIf="data.createdAt">
            {{ formatTimestamp(data.createdAt) }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .record-notification-dialog {
      min-width: 400px;
      max-width: 500px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px 24px 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .trophy-icon {
      color: #ffa726;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .close-btn {
      margin: -8px -8px 0 0;
    }

    .dialog-content {
      padding: 24px;
    }

    .record-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .info-row.main-info {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .label {
      font-size: 14px;
      font-weight: 500;
      opacity: 0.8;
    }

    .value {
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .exercise-name {
      font-size: 20px;
    }

    .inline-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      opacity: 0.7;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 12px;
      margin-top: 8px;
    }

    .metric-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }

    .metric-label {
      font-size: 12px;
      opacity: 0.9;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 24px;
      font-weight: 700;
    }

    .timestamp {
      text-align: center;
      font-size: 12px;
      color: #999;
      margin-top: 8px;
    }

    @media (max-width: 600px) {
      .record-notification-dialog {
        min-width: 300px;
      }

      .metrics {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class RecordNotificationDialogComponent {
  data = inject(MAT_DIALOG_DATA) as RecordNotificationData;
  private dialogRef = inject(MatDialogRef<RecordNotificationDialogComponent>);

  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  }
}

