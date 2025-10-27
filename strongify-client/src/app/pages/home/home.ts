import { Component, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LocationDialogComponent } from './location-dialog.component';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../core/auth/state/auth.actions';
import { selectUser } from '../../core/auth/state/auth.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { LocationService } from '../../core/services/location.service';
import { firstValueFrom } from 'rxjs';
import { LocationDto } from '../../feature/location/data/location.dto';
import { WorkoutRecordDto } from '../../feature/location/data/workout-record.dto';
import { environment } from '../../../environment/environment';

import * as L from 'leaflet';
import { io, Socket } from 'socket.io-client';

const ICON_BASE = 'https://unpkg.com/leaflet@1.9.4/dist/images/';
L.Icon.Default.mergeOptions({
  iconRetinaUrl: ICON_BASE + 'marker-icon-2x.png',
  iconUrl: ICON_BASE + 'marker-icon.png',
  shadowUrl: ICON_BASE + 'marker-shadow.png'
});

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements AfterViewInit, OnDestroy {
  private store = inject(Store);
  private locationService = inject(LocationService);
  private dialog = inject(MatDialog);

  user = toSignal(this.store.select(selectUser), { initialValue: null });

  // map state
  private markers: Record<string, any> = {};
  private records: Record<string, WorkoutRecordDto | null> = {};
  private pollHandle: any = null;
  private map: L.Map | null = null;
  private socket: Socket | null = null;
  private exerciseTypes: any[] = [];

  async ngAfterViewInit() {
    // wait for authenticated user, then setup map so the DOM and route content are present
    this.locationService; // ensure injected
    this.store.select(selectUser).pipe().subscribe(user => {
      if (user) {
        // call setupMap once user is available
        setTimeout(() => this.setupMap(), 0);
      }
    });
    // delegate click for dynamic popup buttons
    document.addEventListener('click', this.onDocumentClick);

    // connect to realtime gateway
    try {
      this.socket = io(environment.apiUrl);
      this.socket.on('record.created', (payload: any) => {
        // payload may include nested relations; normalize to location id
        const locId = payload?.location?.id || payload?.locationId || payload?.location_id || null;
        if (locId) {
          // store latest record for location
          this.records[locId] = payload as WorkoutRecordDto;
          // update popup if marker exists
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
      // ignore socket connect errors
      console.warn('Socket connect failed', err);
    }
  }

  // When Leaflet map container may be hidden during navigation, calling invalidateSize
  // a few times with short delays helps ensure tiles and controls render correctly.
  private ensureMapVisible(map: L.Map) {
    try {
      // call immediately if ready
      map.invalidateSize();
    } catch (e) { /* ignore */ }
    // schedule several retries to handle delayed layout changes
    const delays = [120, 300, 700, 1500];
    delays.forEach(ms => setTimeout(() => { try { map.invalidateSize(); } catch (e) { /* ignore */ } }, ms));
  }

  ngOnDestroy() {
    if (this.pollHandle) clearInterval(this.pollHandle);
    document.removeEventListener('click', this.onDocumentClick);
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private async setupMap() {
    try {
      const mapEl = document.getElementById('home-map');
      if (!mapEl) return;

      this.map = L.map(mapEl).setView([43.3209, 21.8958], 13);

      const map = this.map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // ensure map renders correctly when container becomes visible
      this.ensureMapVisible(map);

  const locations = await this.locationService.getLocations();
      const defaultIcon = this.createPinIcon();
      locations.forEach((loc: LocationDto) => {
        const marker = L.marker([loc.latitude, loc.longitude], { icon: defaultIcon, riseOnHover: true }).addTo(map);
        marker.bindPopup(this.popupHtml(loc));
        this.markers[loc.id] = marker;
      });

  // ensure map sizing after markers added (helps when container was hidden during navigation)
  this.ensureMapVisible(map);

      // load exercise types for prompts
      try {
  this.exerciseTypes = await this.locationService.getExerciseTypes();
      } catch (err) {
        console.warn('Failed to load exercise types', err);
      }

      // initial records load
      await this.refreshRecords();
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
  ${((loc as any).imageUrl) ? `<div class="img-wrap"><img src="${(loc as any).imageUrl}" alt="${loc.name}" /></div>` : ''}
        <div class="record">Top: <span data-loc-record>${recText}</span></div>
        <div class="actions">
          <button class="btn-primary set-record-btn" data-loc-id="${loc.id}">Set new record</button>
        </div>
      </div>
    `;
  }

  // temp pin
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
      const ref = this.dialog.open((await import('./set-record-dialog.component')).SetRecordDialogComponent, {
        width: '480px',
        data: { locationId, exerciseTypes: this.exerciseTypes }
      });
  const res = await firstValueFrom(ref.afterClosed());
      if (res) {
        // created, refresh records
        await this.refreshRecords();
      }
    } catch (err) {
      console.error('Failed to open record dialog', err);
    }
  }

  private async refreshRecords() {
    try {
      const records = await this.locationService.getRecords();
      // keep only latest per location (by createdAt). Normalize records to include locationId, exercise name and value
      const byLoc: Record<string, any> = {};
      records.forEach(r => {
        const rr: any = r as any;
        const locId = rr?.location?.id ?? rr.locationId ?? rr.location_id ?? null;
        if (!locId) return;
        const existing = byLoc[locId];
        const createdAt = rr.createdAt ? new Date(rr.createdAt).getTime() : 0;
        if (!existing || createdAt > (existing.createdAt ? new Date(existing.createdAt).getTime() : 0)) {
          const exerciseName = rr.exerciseType?.name ?? rr.exercise ?? '';
          const value = rr.reps ?? rr.weightKg ?? rr.durationSec ?? null;
          byLoc[locId] = { ...rr, locationId: locId, exercise: exerciseName, value, createdAt: rr.createdAt };
        }
      });

      this.records = byLoc;
      // update marker popups
      Object.keys(this.markers).forEach(id => {
        const marker = this.markers[id];
        const locRecord = this.records[id] ?? null;
        // update stored record
        this.records[id] = locRecord;
        // update popup content
        const popup = marker.getPopup();
        if (!popup) return;
        const oldHtml = popup.getContent();
        if (typeof oldHtml === 'string') {
          // replace the record text inside span[data-loc-record]
          const newText = locRecord ? `${locRecord.exercise}: ${locRecord.value}` : 'No record yet';
          const newHtml = oldHtml.replace(/<span data-loc-record>.*?<\/span>/, `<span data-loc-record>${newText}</span>`);
          popup.setContent(newHtml);
        }
      });
    } catch (err) {
      console.error('Failed to refresh records', err);
    }
  }

  async openAddLocationDialog() {
    const ref = this.dialog.open(LocationDialogComponent, { width: '560px' });
  const res = await firstValueFrom(ref.afterClosed());
    if (res && res.id && this.map) {
      const defaultIcon = this.createPinIcon();
      const created = res as any;
      const marker = L.marker([created.latitude, created.longitude], { icon: defaultIcon }).addTo(this.map);
      marker.bindPopup(this.popupHtml(created as LocationDto));
      this.markers[created.id] = marker;
      marker.openPopup();
      // add to exercise types or other caches if needed
    }
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
