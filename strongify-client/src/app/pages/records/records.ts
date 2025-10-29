import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectUser } from '../../core/auth/state/auth.selectors';
import { LocationService } from '../../feature/location/location.service';
import { WorkoutRecordService } from '../../feature/workout-record/workout-record.service';
import { ExerciseTypeDto } from '../../feature/location/data/location.dto';
import { WorkoutRecordDto } from '../../feature/workout-record/data/workout-record.dto';
import { Subject, BehaviorSubject, switchMap, concatMap, scan, shareReplay, startWith, catchError, of } from 'rxjs';
import { RecordModal } from '../../shared/record-modal/record-modal';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [CommonModule, RecordModal],
  templateUrl: './records.html',
  styleUrls: ['./records.scss']
})
export class Records implements OnInit {
  @ViewChild(RecordModal) modal!: RecordModal;
  
  private store = inject(Store);
  private locationService = inject(LocationService);
  private workoutRecordService = inject(WorkoutRecordService);
  
  user = toSignal(this.store.select(selectUser), { initialValue: null });
  loading = signal(true);
  exerciseTypes = signal<ExerciseTypeDto[]>([]);
  selectedExerciseType = signal<ExerciseTypeDto | null>(null);
  
  // Infinite scroll implementation
  private pageRequests$ = new Subject<number>();
  private selectedExerciseId$ = new BehaviorSubject<string | null>(null);
  
  records$ = this.selectedExerciseId$.pipe(
    switchMap(exerciseId => {
      if (!exerciseId) {
        console.log('No exercise ID selected');
        return of([]);
      }
      
      console.log('Loading records for exercise:', exerciseId);
      
      // Reset page counter when exercise type changes
      return this.pageRequests$.pipe(
        startWith(1), // Start with page 1
        concatMap(page => {
          console.log(`Loading page ${page} for exercise ${exerciseId}`);
          return this.workoutRecordService.getTopRecordsByExerciseType(exerciseId, page).pipe(
            catchError(err => {
              console.error('Error loading records:', err);
              return of([]);
            })
          );
        }),
        scan((all, pageData) => {
          console.log('Received page data:', pageData);
          
          // Check if we've reached the end (no more records or less than page size)
          if (pageData.length === 0 || pageData.length < 10) {
            this.hasMorePages.set(false);
            console.log('No more pages to load');
          }
          
          const newRecords = [...all, ...pageData];
          console.log('Total records:', newRecords.length);
          return newRecords;
        }, [] as WorkoutRecordDto[]),
        shareReplay(1)
      );
    }),
    shareReplay(1)
  );
  
  records = toSignal(this.records$, { initialValue: [] as WorkoutRecordDto[] });
  currentPage = signal(1);
  hasMorePages = signal(true);
  loadingMore = signal(false);
  
  // Modal state
  selectedRecord = signal<WorkoutRecordDto | null>(null);
  selectedRecordRank = signal<number | null>(null);

  ngOnInit() {
    this.loadExerciseTypes();
  }

  loadExerciseTypes() {
    this.loading.set(true);
    this.locationService.getExerciseTypes().subscribe({
      next: (types) => {
        this.exerciseTypes.set(types);
        this.loading.set(false);
        
        // Auto-select first exercise type if available
        if (types.length > 0) {
          this.selectExerciseType(types[0]);
        }
      },
      error: (err) => {
        console.error('Failed to load exercise types', err);
        this.loading.set(false);
      }
    });
  }

  selectExerciseType(exerciseType: ExerciseTypeDto) {
    if (this.selectedExerciseType()?.id === exerciseType.id) {
      return; // Don't reload if same exercise is selected
    }
    
    this.selectedExerciseType.set(exerciseType);
    this.selectedExerciseId$.next(exerciseType.id);
    this.currentPage.set(1);
    this.hasMorePages.set(true);
  }

  loadMore() {
    if (!this.hasMorePages() || this.loadingMore()) return;
    
    this.loadingMore.set(true);
    const nextPage = this.currentPage() + 1;
    this.currentPage.set(nextPage);
    
    this.pageRequests$.next(nextPage);
    
    // Reset loading state after a delay
    setTimeout(() => this.loadingMore.set(false), 500);
  }

  onScroll(event: Event) {
    const element = event.target as HTMLElement;
    const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100;
    
    if (atBottom && this.hasMorePages() && !this.loadingMore()) {
      this.loadMore();
    }
  }

  openRecordModal(record: WorkoutRecordDto, rank: number) {
    this.selectedRecord.set(record);
    this.selectedRecordRank.set(rank);
    setTimeout(() => {
      this.modal?.open();
    });
  }

  closeRecordModal() {
    this.selectedRecord.set(null);
    this.selectedRecordRank.set(null);
  }
}

