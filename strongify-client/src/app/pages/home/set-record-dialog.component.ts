import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { LocationService } from '../../core/services/location.service';

export interface SetRecordDialogData {
  locationId: string;
  exerciseTypes?: any[];
}

@Component({
  selector: 'app-set-record-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Set Record</h2>
    <div mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field style="width:100%">
          <mat-label>Exercise</mat-label>
          <mat-select formControlName="exerciseTypeId">
            <mat-option *ngFor="let e of exerciseTypes" [value]="e.id">{{e.name}}</mat-option>
          </mat-select>
        </mat-form-field>

        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <mat-form-field style="flex:1;min-width:140px">
            <input matInput type="number" placeholder="Reps" formControlName="reps" />
          </mat-form-field>

          <mat-form-field style="flex:1;min-width:140px">
            <input matInput type="number" placeholder="Weight (kg)" formControlName="weightKg" />
          </mat-form-field>

          <mat-form-field style="flex:1;min-width:140px">
            <input matInput type="number" placeholder="Duration (sec)" formControlName="durationSec" />
          </mat-form-field>

          <mat-form-field style="flex:1;min-width:120px">
            <input matInput type="number" step="0.1" placeholder="RPE (1-10)" formControlName="rpe" />
          </mat-form-field>
        </div>

        <mat-form-field style="width:100%">
          <textarea matInput placeholder="Notes (optional)" formControlName="notes"></textarea>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions style="justify-content:flex-end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="submit()" [disabled]="form.invalid">Save</button>
    </div>
  `
})
export class SetRecordDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<SetRecordDialogComponent>);
  private data = inject(MAT_DIALOG_DATA) as SetRecordDialogData;
  private fb = inject(FormBuilder);
  private locationService = inject(LocationService);

  exerciseTypes: any[] = [];

  form = this.fb.group({
    exerciseTypeId: ['', Validators.required],
    reps: [null],
    weightKg: [null],
    durationSec: [null],
    rpe: [null],
    notes: ['']
  });

  ngOnInit(): void {
    if (this.data?.exerciseTypes && this.data.exerciseTypes.length) {
      this.exerciseTypes = this.data.exerciseTypes;
    } else {
      this.locationService.getExerciseTypes().then(list => this.exerciseTypes = list).catch(() => this.exerciseTypes = []);
    }
  }

  async submit() {

    const exId = this.form.value.exerciseTypeId;
    if (!exId) return;
    const ex = this.exerciseTypes.find(e => e.id === exId) || {};

    const dto: any = {
      location: { id: this.data.locationId },
      exerciseType: { id: exId }
    };

    const reps = this.form.value.reps;
    const weightKg = this.form.value.weightKg;
    const durationSec = this.form.value.durationSec;
    const rpe = this.form.value.rpe;
    const notes = this.form.value.notes;

    if (reps != null && reps !== '') dto.reps = Math.round(Number(reps));
    if (weightKg != null && weightKg !== '') dto.weightKg = Number(weightKg);
    if (durationSec != null && durationSec !== '') dto.durationSec = Number(durationSec);
    if (rpe != null && rpe !== '') dto.rpe = Number(rpe);
    if (notes) dto.notes = notes;

    if (!dto.reps && !dto.weightKg && !dto.durationSec) {
      if (ex.measuresReps) dto.reps = 1;
      else if (ex.measuresWeight) dto.weightKg = 0;
      else dto.durationSec = 0;
    }

    try {
      const res = await this.locationService.createRecord(dto);
      this.dialogRef.close(res);
    } catch (err) {
      console.error('Failed to create record', err);
      alert('Failed to create record');
    }
  }

  close() { this.dialogRef.close(null); }
}
