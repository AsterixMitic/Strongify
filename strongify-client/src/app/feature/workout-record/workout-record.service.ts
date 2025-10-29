import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environment/environment';
import { WorkoutRecordDto } from './data/workout-record.dto';
import { catchError } from 'rxjs';
import { ErrorService } from '../../core/services/error.service';

@Injectable({
  providedIn: 'root'
})
export class WorkoutRecordService {
  private http = inject(HttpClient);
  private errorService = inject(ErrorService);
  private base = environment.apiUrl;

  getTopRecordsByExerciseType(exerciseTypeId: string, pageNum: number) {
    return this.http.get<WorkoutRecordDto[]>(
      `${this.base}/workout-record/stats/top/${exerciseTypeId}/${pageNum}`
    ).pipe(
      catchError((err) => this.errorService.handleHttpError(err))
    );
  }
}

