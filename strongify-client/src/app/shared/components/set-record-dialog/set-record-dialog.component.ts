//set-ecord-dialog.component.ts

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { LocationService } from '../../../feature/location/location.service';
import {CreateRecordDto } from '../../../feature/location/data/location.dto';
import { ExerciseTypeDto } from '../../../feature/exercise-type/data/exercise-type.dto';

export interface SetRecordDialogData {
  locationId: string;
  exerciseTypes?: ExerciseTypeDto[];
}

@Component({
  selector: 'app-set-record-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Set Record</h2>
    <div mat-dialog-content class="set-record-dialog">
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>Exercise</mat-label>
          <mat-select formControlName="exerciseTypeId" panelClass="white-select-panel">
            <mat-option *ngFor="let e of exerciseTypes" [value]="e.id">{{e.name}}</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="controls-row">
          <mat-form-field class="control-field" *ngIf="selectedEx?.measuresReps">
            <input matInput type="number" placeholder="Reps" formControlName="reps" />
          </mat-form-field>

          <mat-form-field class="control-field" *ngIf="selectedEx?.measuresWeight">
            <input matInput type="number" placeholder="Weight (kg)" formControlName="weightKg" />
          </mat-form-field>

          <mat-form-field class="control-field" *ngIf="selectedEx?.measuresTime">
            <input matInput type="number" placeholder="Duration (sec)" formControlName="durationSec" />
          </mat-form-field>

          <mat-form-field class="control-field">
            <input matInput type="number" step="0.1" placeholder="RPE (1-10)" formControlName="rpe" />
          </mat-form-field>
        </div>

      </form>
    </div>
    <div mat-dialog-actions style="justify-content:flex-end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="submit()" [disabled]="form.invalid">Save</button>
    </div>
  `,
  styleUrls: ['./set-record-dialog.component.scss']
})
export class SetRecordDialogComponent implements OnInit, OnDestroy {
  private dialogRef = inject(MatDialogRef<SetRecordDialogComponent>);
  private data = inject(MAT_DIALOG_DATA) as SetRecordDialogData;
  private fb = inject(FormBuilder);
  private locationService = inject(LocationService);

  exerciseTypes: ExerciseTypeDto[] = [];
  private controlSub: any = null;

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
      this.updateEnabledFields(this.form.value.exerciseTypeId);
    } else {
      this.locationService.getExerciseTypes().subscribe({
        next: list => { this.exerciseTypes = list; this.updateEnabledFields(this.form.value.exerciseTypeId); },
        error: () => this.exerciseTypes = []
      });
    }

    const ctrl = this.form.get('exerciseTypeId');
    this.controlSub = ctrl?.valueChanges.subscribe((id: string | null) => this.updateEnabledFields(id));
  }

  get selectedEx(): ExerciseTypeDto | undefined {
    const id = this.form.get('exerciseTypeId')?.value;
    return this.exerciseTypes.find(e => e.id === id);
  }

  ngOnDestroy(): void {
    if (this.controlSub) this.controlSub.unsubscribe?.();
  }

  private updateEnabledFields(exerciseTypeId?: string | null) {
    const ex = this.exerciseTypes.find(e => e.id === exerciseTypeId);
    const repsCtrl = this.form.get('reps');
    const weightCtrl = this.form.get('weightKg');
    const durCtrl = this.form.get('durationSec');

    if (ex) {
      if (!ex.measuresReps) { repsCtrl?.setValue(null); }
      if (!ex.measuresWeight) { weightCtrl?.setValue(null); }
      if (!ex.measuresTime) { durCtrl?.setValue(null); }
    } else {
      repsCtrl?.setValue(null); weightCtrl?.setValue(null); durCtrl?.setValue(null);
    }
  }

  async submit() {

    const exId = this.form.value.exerciseTypeId;
    if (!exId) return;
    const ex = this.exerciseTypes.find(e => e.id === exId);

    const dto: CreateRecordDto = {
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
      if (ex?.measuresReps) dto.reps = 1;
      else if (ex?.measuresWeight) dto.weightKg = 0;
      else dto.durationSec = 0;
    }

    this.locationService.createRecord(dto).subscribe({
      next: (res) => this.dialogRef.close(res),
      error: (err) => {
        console.error('Failed to create record', err);
        alert('Failed to create record');
      }
    });
  }

  close() { this.dialogRef.close(null); }
}
