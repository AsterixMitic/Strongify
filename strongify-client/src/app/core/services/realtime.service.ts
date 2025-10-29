import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface RecordCreatedEvent {
  id?: string;
  userId?: string;
  locationId: string;
  exercise: string;
  reps?: number;
  weightKg?: number;
  durationSec?: number;
  value?: number;
  createdAt?: string;
  location?: { id?: string; name?: string };
  exerciseType?: { name?: string };
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private _recordCreated$ = new Subject<RecordCreatedEvent>();
  
  // Observable that components can subscribe to
  public recordCreated$ = this._recordCreated$.asObservable();

  // Method to emit a record created event
  emitRecordCreated(payload: any) {
    const locId = payload?.location?.id || payload?.locationId || payload?.location_id || null;
    if (locId) {
      const normalized: RecordCreatedEvent = {
        id: payload?.id,
        userId: payload?.userId,
        locationId: locId,
        exercise: payload?.exerciseType?.name ?? payload?.exercise ?? '',
        reps: payload?.reps,
        weightKg: payload?.weightKg,
        durationSec: payload?.durationSec,
        value: payload?.value ?? payload?.reps ?? payload?.weightKg ?? payload?.durationSec ?? undefined,
        createdAt: payload?.createdAt,
        location: payload?.location,
        exerciseType: payload?.exerciseType
      };
      this._recordCreated$.next(normalized);
    }
  }
}

