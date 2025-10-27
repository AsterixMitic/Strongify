import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../environment/environment';
import { LocationDto } from '../../feature/location/data/location.dto';
import { WorkoutRecordDto } from '../../feature/location/data/workout-record.dto';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  async getLocations(): Promise<LocationDto[]> {
    return firstValueFrom(this.http.get<LocationDto[]>(`${this.base}/location`));
  }

  async getExerciseTypes(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.base}/exercise-type`));
  }

  async createExerciseType(dto: { name: string; description?: string }) {
    return firstValueFrom(this.http.post(`${this.base}/exercise-type`, dto));
  }

  async createLocation(dto: any) {
    return firstValueFrom(this.http.post(`${this.base}/location`, dto).pipe(timeout(10000)));
  }

  async updateLocation(id: string, dto: any) {
    return firstValueFrom(this.http.patch(`${this.base}/location/${id}`, dto));
  }

  async uploadLocationImage(locationId: string, file: File) {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return firstValueFrom(this.http.post(`${this.base}/storage/location/${locationId}/image`, fd));
  }

  async getRecords(): Promise<WorkoutRecordDto[]> {
    return firstValueFrom(this.http.get<WorkoutRecordDto[]>(`${this.base}/workout-record`));
  }

  async createRecord(dto: any) {
    return firstValueFrom(this.http.post(`${this.base}/workout-record`, dto));
  }
}
