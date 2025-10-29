import { Component, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { LocationService } from '../../feature/location/data/location.service';
import { firstValueFrom, zip, Subscription } from 'rxjs';
import { LocationDto, ExerciseTypeDto } from '../../feature/location/data/location.dto';
import { WorkoutRecordDto } from '../../feature/workout-record/data/workout-record.dto';
import { environment } from '../../../environment/environment';
import * as L from 'leaflet';
import { io, Socket } from 'socket.io-client';

type NormalizedRecord = Partial<WorkoutRecordDto> & { exercise?: string; value?: number | undefined; createdAt?: string | undefined; locationId?: string; reps?: number; weightKg?: number; durationSec?: number; exerciseType?: { name?: string } };

const ICON_BASE = 'https://unpkg.com/leaflet@1.9.4/dist/images/';
L.Icon.Default.mergeOptions({
  iconRetinaUrl: ICON_BASE + 'marker-icon-2x.png',
  iconUrl: ICON_BASE + 'marker-icon.png',
  shadowUrl: ICON_BASE + 'marker-shadow.png'
});

@Component({
  selector: 'app-map',
  imports: [CommonModule],
  templateUrl: './map.html',
  styleUrl: './map.scss'
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private locationService = inject(LocationService);
  private dialog = inject(MatDialog);

  private markers: Record<string, L.Marker> = {};
  private records: Record<string, NormalizedRecord | null> = {};
  private map: L.Map | null = null;
  private socket: Socket | null = null;
  private exerciseTypes: ExerciseTypeDto[] = [];
  private recordsSub: Subscription | null = null;

  async ngAfterViewInit() {
    setTimeout(() => this.setupMap(), 0);
    document.addEventListener('click', this.onDocumentClick);

    try {
      this.socket = io(environment.apiUrl);
      this.socket.on('record.created', (payload: any) => {
        const locId = payload?.location?.id || payload?.locationId || payload?.location_id || null;
        if (locId) {
          const normalized: NormalizedRecord = {
            id: payload?.id,
            userId: payload?.userId,
            locationId: locId,
            exercise: payload?.exerciseType?.name ?? payload?.exercise ?? '',
            reps: payload?.reps,
            weightKg: payload?.weightKg,
            durationSec: payload?.durationSec,
            value: payload?.value ?? payload?.reps ?? payload?.weightKg ?? payload?.durationSec ?? undefined,
            createdAt: payload?.createdAt
          };
          this.records[locId] = normalized;
          const marker = this.markers[locId];
          if (marker) {
            const popup = marker.getPopup();
            if (popup) {
              const newText = `${payload.exerciseType?.name || payload.exercise || ''}: ${payload.value ?? payload.reps ?? payload.weightKg ?? ''}`;
              const oldHtml = popup.getContent();
              if (typeof oldHtml === 'string') {
                const newHtml = oldHtml.replace(/<span data-loc-record>.*?<\/span>/, `<span data-loc-record>${newText}</span>`);
                popup.setContent(newHtml);
              }
            }
          }
        }
      });
    } catch (err) {
      console.warn('Socket connect failed', err);
    }
  }

  private ensureMapVisible(map: L.Map) {
    try {
      map.invalidateSize();
    } catch (e) { }
    const delays = [120, 300, 700, 1500];
    delays.forEach(ms => setTimeout(() => { try { map.invalidateSize(); } catch (e) { } }, ms));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.onDocumentClick);
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.recordsSub) {
      this.recordsSub.unsubscribe();
      this.recordsSub = null;
    }
  }

  private async setupMap() {
    try {
      const mapEl = document.getElementById('locations-map');
      if (!mapEl) return;

      this.map = L.map(mapEl).setView([43.3209, 21.8958], 13);

      const map = this.map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      this.ensureMapVisible(map);

      try {
        zip(
          this.locationService.getLocations(),
          this.locationService.getExerciseTypes(),
          this.locationService.getRecords()
        ).subscribe({
          next: ([locations, exerciseTypes, records]) => {
            const defaultIcon = this.createPinIcon();
            locations.forEach((loc: LocationDto) => {
              const marker = L.marker([loc.latitude, loc.longitude], { icon: defaultIcon, riseOnHover: true }).addTo(map);
              marker.bindPopup(this.popupHtml(loc));
              this.markers[loc.id] = marker;
            });

            this.ensureMapVisible(map);

            this.exerciseTypes = exerciseTypes;

            try {
              type RawRecord = Partial<WorkoutRecordDto> & { location?: { id?: string }; locationId?: string; location_id?: string; exerciseType?: { name?: string }; weightKg?: number; durationSec?: number; reps?: number };
              const byLoc: Record<string, RawRecord & { exercise?: string; value?: number | undefined; createdAt?: string | undefined }> = {};
              records.forEach(r => {
                const rr = r as RawRecord;
                const locId = rr?.location?.id ?? rr.locationId ?? rr.location_id ?? null;
                if (!locId) return;
                const existing = byLoc[locId];
                const createdAt = rr.createdAt ? new Date(rr.createdAt).getTime() : 0;
                if (!existing || createdAt > (existing.createdAt ? new Date(existing.createdAt).getTime() : 0)) {
                  const exerciseName = rr.exerciseType?.name ?? rr.exercise ?? '';
                  const value = rr.reps ?? rr.weightKg ?? rr.durationSec ?? undefined;
                  const entry: RawRecord & { exercise?: string; value?: number | undefined; createdAt?: string | undefined } = {
                    id: rr.id,
                    userId: rr.userId,
                    locationId: locId,
                    exercise: exerciseName,
                    reps: rr.reps,
                    weightKg: rr.weightKg,
                    durationSec: rr.durationSec,
                    exerciseType: rr.exerciseType,
                    value,
                    createdAt: rr.createdAt
                  };
                  byLoc[locId] = entry;
                }
              });

              this.records = byLoc as Record<string, NormalizedRecord | null>;
            } catch (err) {
              console.warn('Failed to normalize initial records', err);
            }
          },
          error: (err) => console.warn('Failed to load map data', err)
        });
      } catch (err) {
        console.warn('Map setup failed', err);
      }
    } catch (err) {
      console.error('Map setup failed', err);
    }
  }

  private popupHtml(loc: LocationDto) {
    const record = this.records[loc.id];
    const recText = record ? `${record.exercise ?? ''}: ${record.value ?? ''}` : 'No record yet';
    return `
      <div class="loc-popup">
        <strong>${loc.name}</strong>
        <div class="desc">${loc.description ?? ''}</div>
  ${loc.imageUrl ? `<div class="img-wrap"><img src="${loc.imageUrl}" alt="${loc.name}" /></div>` : ''}
        <div class="record">Top: <span data-loc-record>${recText}</span></div>
        <div class="actions">
          <button class="btn-primary set-record-btn" data-loc-id="${loc.id}">Set new record</button>
        </div>
      </div>
    `;
  }

  private createPinIcon(color = '#667eea') {
    const svg = `
      <svg width="32" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path fill="${color}" d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
      </svg>
    `;
    return L.divIcon({
      className: 'material-marker',
      html: svg,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -38]
    });
  }

  private onDocumentClick = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;
    if (target && target.classList.contains('set-record-btn')) {
      const locId = target.getAttribute('data-loc-id');
      if (!locId) return;
      this.openSetRecordDialog(locId);
    }
  };

  async openSetRecordDialog(locationId: string) {
    try {
      const ref = this.dialog.open((await import('../../pages/home/set-record-dialog.component')).SetRecordDialogComponent, {
        width: '480px',
        data: { locationId, exerciseTypes: this.exerciseTypes }
      });
      const res = await firstValueFrom(ref.afterClosed());
      if (res) {
        await this.refreshRecords();
      }
    } catch (err) {
      console.error('Failed to open record dialog', err);
    }
  }

  private refreshRecords() {
    if (this.recordsSub) {
      this.recordsSub.unsubscribe();
      this.recordsSub = null;
    }
    this.recordsSub = this.locationService.getRecords().subscribe({
      next: (records) => {
        try {
          type RawRecord = Partial<WorkoutRecordDto> & { location?: { id?: string }; locationId?: string; location_id?: string; exerciseType?: { name?: string }; weightKg?: number; durationSec?: number; reps?: number };
          const byLoc: Record<string, RawRecord & { exercise?: string; value?: number | undefined; createdAt?: string | undefined }> = {};
          records.forEach(r => {
            const rr = r as RawRecord;
            const locId = rr?.location?.id ?? rr.locationId ?? rr.location_id ?? null;
            if (!locId) return;
            const existing = byLoc[locId];
            const createdAt = rr.createdAt ? new Date(rr.createdAt).getTime() : 0;
            if (!existing || createdAt > (existing.createdAt ? new Date(existing.createdAt).getTime() : 0)) {
              const exerciseName = rr.exerciseType?.name ?? rr.exercise ?? '';
              const value = rr.reps ?? rr.weightKg ?? rr.durationSec ?? undefined;
              const entry: RawRecord & { exercise?: string; value?: number | undefined; createdAt?: string | undefined } = {
                id: rr.id,
                userId: rr.userId,
                locationId: locId,
                exercise: exerciseName,
                reps: rr.reps,
                weightKg: rr.weightKg,
                durationSec: rr.durationSec,
                exerciseType: rr.exerciseType,
                value,
                createdAt: rr.createdAt
              };
              byLoc[locId] = entry;
            }
          });

          this.records = byLoc as Record<string, NormalizedRecord | null>;
          Object.keys(this.markers).forEach(id => {
            const marker = this.markers[id];
            const locRecord = this.records[id] ?? null;
            this.records[id] = locRecord;
            const popup = marker.getPopup();
            if (!popup) return;
            const oldHtml = popup.getContent();
            if (typeof oldHtml === 'string') {
              const newText = locRecord ? `${locRecord.exercise}: ${locRecord.value}` : 'No record yet';
              const newHtml = oldHtml.replace(/<span data-loc-record>.*?<\/span>/, `<span data-loc-record>${newText}</span>`);
              popup.setContent(newHtml);
            }
          });
        } catch (err) {
          console.error('Failed to refresh records', err);
        }
      },
      error: (err) => console.error('Failed to refresh records', err)
    });
  }

  async openAddLocationDialog() {
    const ref = this.dialog.open((await import('../../pages/home/location-dialog.component')).LocationDialogComponent, { width: '560px' });
    const res = await firstValueFrom(ref.afterClosed());
    if (res && res.id && this.map) {
      const defaultIcon = this.createPinIcon();
      const created = res as LocationDto;
      const marker = L.marker([created.latitude, created.longitude], { icon: defaultIcon }).addTo(this.map);
      marker.bindPopup(this.popupHtml(created));
      this.markers[created.id] = marker;
      marker.openPopup();
    }
  }
}

