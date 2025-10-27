import { Component, inject, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LocationService } from '../../core/services/location.service';
import * as L from 'leaflet';
import { ImageUploaderComponent } from '../../shared/components/image-uploader/image-uploader.component';

@Component({
  selector: 'app-location-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, ImageUploaderComponent],
  template: `
  <div class="update-container">
    <div class="update-card">
      <div class="update-header">
        <h2>Add location</h2>
        <button class="close-btn" (click)="close()">✕</button>
      </div>

      <form [formGroup]="form" class="update-form" (ngSubmit)="submit()">
        <div class="form-group">
          <label class="form-label">Name</label>
          <input type="text" formControlName="name" class="form-input" placeholder="Location name" />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea formControlName="description" class="form-input" rows="3" placeholder="A short description"></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Image</label>
          <!-- shared uploader - emits fileChange when a file is selected -->
          <app-image-uploader
            label="Location image"
            (fileChange)="onFileSelected($event)"
            (error)="onUploadError($event)"
          ></app-image-uploader>
        </div>

        <div class="form-group">
          <label class="form-label">Drop a pin</label>
          <div id="loc-dialog-map" style="height:240px;border-radius:6px;border:1px solid #e0e0e0"></div>
          <p class="help-text">Click the map to drop a pin. Drag to adjust.</p>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="close()" [disabled]="loading">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || !marker || loading">
            <span *ngIf="loading" class="spinner" aria-hidden="true"></span>
            <span *ngIf="loading">Creating…</span>
            <span *ngIf="!loading">Create</span>
          </button>
        </div>
      </form>
    </div>
  </div>
  `
  ,
  styleUrls: ['./location-dialog.component.scss']
})
export class LocationDialogComponent implements AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<LocationDialogComponent>);
  private locationService = inject(LocationService);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
  });

  loading = false;

  private map: L.Map | null = null;
  marker: L.Marker | null = null;
  selectedFile: File | null = null;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap() {
    const el = document.getElementById('loc-dialog-map');
    if (!el) return;
    this.map = L.map(el).setView([43.3209, 21.8958], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);


    try { this.map.invalidateSize(); } catch (e) { /* ignore */ }
    [120, 300, 700].forEach(ms => setTimeout(() => { try { this.map?.invalidateSize(); } catch (e) { } }, ms));

    this.map.on('click', (ev: any) => {
      const latlng = ev.latlng;
      const icon = this.createPinIcon();
      if (!this.marker) {
        this.marker = L.marker([latlng.lat, latlng.lng], { icon, draggable: true }).addTo(this.map!);
        this.marker.on('dragend', () => {
        });
      } else {
        this.marker.setLatLng([latlng.lat, latlng.lng]);
      }
    });
  }

  private createPinIcon(color = '#667eea') {
    const svg = `
      <svg width="32" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
      </svg>`;
    return L.divIcon({
      className: 'material-marker',
      html: svg,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -38]
    });
  }

  async submit() {
    if (!this.form.valid || !this.marker) return;
    const latlng = this.marker.getLatLng();
    const dto: any = {
      name: this.form.value.name,
      description: this.form.value.description,
      imageUrl: undefined,
      latitude: Number(latlng.lat),
      longitude: Number(latlng.lng)
    };
    try {
      this.loading = true;
  const created: any = await this.locationService.createLocation(dto);

      // if a file was selected, upload it and then patch the location with the public URL
      if (this.selectedFile && created && created.id) {
        try {
          const uploadRes: any = await this.locationService.uploadLocationImage(created.id, this.selectedFile);
          if (uploadRes && uploadRes.url) {
            await this.locationService.updateLocation(created.id, { imageUrl: uploadRes.url });
            (created as any).imageUrl = uploadRes.url;
          }
        } catch (uErr) {
          console.warn('Image upload failed', uErr);
        }
      }
          this.loading = false;

      this.dialogRef.close(created);
    } catch (err) {
      console.error('Create location failed', err);
      alert('Failed to create location');
    }
  }

  onFileSelected(file: File) {
    this.selectedFile = file;
  }

  onUploadError(msg: string) {
    console.warn('Uploader error', msg);
  }

  close() {
    this.dialogRef.close(null);
  }
}
