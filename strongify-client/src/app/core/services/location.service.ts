import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../environment/environment';
import { LocationDto, CreateLocationDto, UpdateLocationDto, ExerciseTypeDto, CreateRecordDto } from '../../feature/location/data/location.dto';
import { WorkoutRecordDto } from '../../feature/location/data/workout-record.dto';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getLocations(): Observable<LocationDto[]> {
    return this.http.get<LocationDto[]>(`${this.base}/location`);
  }

  getExerciseTypes(): Observable<ExerciseTypeDto[]> {
    return this.http.get<ExerciseTypeDto[]>(`${this.base}/exercise-type`);
  }

  createExerciseType(dto: { name: string; description?: string }) {
    return this.http.post(`${this.base}/exercise-type`, dto);
  }

  createLocation(dto: CreateLocationDto) {
    return this.http.post<LocationDto>(`${this.base}/location`, dto).pipe(timeout(10000));
  }

  updateLocation(id: string, dto: UpdateLocationDto) {
    return this.http.patch<LocationDto>(`${this.base}/location/${id}`, dto);
  }

  uploadLocationImage(locationId: string, file: File) {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post(`${this.base}/storage/location/${locationId}/image`, fd);
  }

  getRecords(): Observable<WorkoutRecordDto[]> {
    return this.http.get<WorkoutRecordDto[]>(`${this.base}/workout-record`);
  }

  createRecord(dto: CreateRecordDto) {
    return this.http.post(`${this.base}/workout-record`, dto);
  }
}
