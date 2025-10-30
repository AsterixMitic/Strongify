import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  signal,
  computed,
  effect,
  ViewChildren,
  ElementRef,
  QueryList,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { LocationService } from '../../feature/location/location.service';
import { ExerciseTypeDto } from '../../feature/location/data/location.dto';
import { WorkoutRecordDto } from '../../feature/workout-record/data/workout-record.dto';
import { selectUser } from '../../core/auth/state/auth.selectors';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

interface ExerciseProgress {
  exerciseType: ExerciseTypeDto;
  records: WorkoutRecordDto[];
  totalWorkouts: number;
  charts: ChartData[];
}

interface ChartData {
  type: 'reps' | 'weight' | 'duration';
  label: string;
  records: Array<{ value: number; date: string }>;
  maxValue: number;
  latestValue: number;
}

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workouts.html',
  styleUrls: ['./workouts.scss'],
})
export class Workouts implements OnInit, AfterViewInit, OnDestroy {
  private locationService = inject(LocationService);
  private store = inject(Store);

  @ViewChildren('chartCanvas') canvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  user = toSignal(this.store.select(selectUser), { initialValue: null });
  exerciseTypes = signal<ExerciseTypeDto[]>([]);
  loading = signal(true);
  selectedExerciseIds = signal<Set<string>>(new Set());

  // keep chart instances by "exerciseId-type" key
  private charts: Map<string, Chart> = new Map();

  allExerciseProgress = computed(() => {
    const user = this.user();
    const types = this.exerciseTypes();

    if (!user || !user.workoutRecords || types.length === 0) return [];

    const progressMap = new Map<string, ExerciseProgress>();

    types.forEach((type) => {
      const records = user.workoutRecords
        .filter((record) => {
          if (record.exerciseType) {
            return (
              record.exerciseType.id === type.id ||
              record.exerciseType.name === type.name
            );
          }
          return record.exercise === type.name;
        })
        .sort(
          (a, b) =>
            new Date(a.createdAt || '').getTime() -
            new Date(b.createdAt || '').getTime()
        );

      if (records.length === 0) return;

      const charts: ChartData[] = [];

      if (type.measuresReps) {
        const repsData = records
          .filter((r) => r.reps != null && r.reps > 0)
          .map((r) => ({ value: r.reps!, date: r.createdAt || '' }));
        if (repsData.length > 0) {
          charts.push({
            type: 'reps',
            label: 'Reps',
            records: repsData,
            maxValue: Math.max(...repsData.map((d) => d.value)),
            latestValue: repsData[repsData.length - 1].value,
          });
        }
      }

      if (type.measuresWeight) {
        const weightData = records
          .filter((r) => r.weightKg != null && r.weightKg > 0)
          .map((r) => ({ value: r.weightKg!, date: r.createdAt || '' }));
        if (weightData.length > 0) {
          charts.push({
            type: 'weight',
            label: 'Weight (kg)',
            records: weightData,
            maxValue: Math.max(...weightData.map((d) => d.value)),
            latestValue: weightData[weightData.length - 1].value,
          });
        }
      }

      const durationData = records
        .filter((r) => r.durationSec != null && r.durationSec > 0)
        .map((r) => ({ value: r.durationSec!, date: r.createdAt || '' }));
      if (durationData.length > 0) {
        charts.push({
          type: 'duration',
          label: 'Duration (sec)',
          records: durationData,
          maxValue: Math.max(...durationData.map((d) => d.value)),
          latestValue: durationData[durationData.length - 1].value,
        });
      }

      if (charts.length > 0) {
        progressMap.set(type.id, {
          exerciseType: type,
          records,
          totalWorkouts: records.length,
          charts,
        });
      }
    });

    return Array.from(progressMap.values());
  });

  exerciseProgress = computed(() => {
    const all = this.allExerciseProgress();
    const selected = this.selectedExerciseIds();
    return selected.size === 0
      ? all
      : all.filter((p) => selected.has(p.exerciseType.id));
  });

  availableExercises = computed(() =>
    this.allExerciseProgress().map((p) => ({
      id: p.exerciseType.id,
      name: p.exerciseType.name,
      count: p.totalWorkouts,
    }))
  );

  ngOnInit() {
    this.loadExerciseTypes();

    // Re-render charts AFTER Angular has applied any view changes coming from signals
    effect(() => {
      void this.exerciseProgress(); // track deps
      afterNextRender(() => this.renderCharts());
    });
  }

  ngAfterViewInit() {
    // If the canvas list changes (filtering), (re)render charts
    if (this.canvases) {
      this.canvases.changes.subscribe(() => this.renderCharts());
      this.renderCharts();
    }
  }

  ngOnDestroy() {
    this.destroyAllCharts();
  }

  loadExerciseTypes() {
    this.loading.set(true);
    this.locationService.getExerciseTypes().subscribe({
      next: (types) => {
        this.exerciseTypes.set(types);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load exercise types', err);
        this.loading.set(false);
      },
    });
  }

  toggleExercise(exerciseId: string) {
    const current = new Set(this.selectedExerciseIds());
    current.has(exerciseId) ? current.delete(exerciseId) : current.add(exerciseId);
    this.selectedExerciseIds.set(current);
  }

  selectAll() {
    // empty set => "all selected"
    this.selectedExerciseIds.set(new Set());
  }

  isExerciseSelected(exerciseId: string): boolean {
    const selected = this.selectedExerciseIds();
    return selected.size === 0 || selected.has(exerciseId);
  }

  /** Render charts for all canvases currently present in the view */
  private renderCharts() {
    if (!this.canvases) return;

    // Build lookup key -> ChartData
    const dataByKey = new Map<string, ChartData>();
    for (const prog of this.exerciseProgress()) {
      for (const cd of prog.charts) {
        dataByKey.set(`${prog.exerciseType.id}-${cd.type}`, cd);
      }
    }

    // Destroy charts that no longer have a canvas
    const liveKeys = new Set(
      this.canvases.map((el) => el.nativeElement.dataset['key'] || '')
    );
    for (const [key, chart] of this.charts) {
      if (!liveKeys.has(key)) {
        try {
          chart.destroy();
        } catch {}
        this.charts.delete(key);
      }
    }

    // Create or update charts for each present canvas
    this.canvases.forEach((el) => {
      const canvas = el.nativeElement;
      const key = canvas.dataset['key'];
      if (!key) return;

      const chartData = dataByKey.get(key);
      if (!chartData) return;

      const labels = chartData.records.map((_, i) => `#${i + 1}`);
      const data = chartData.records.map((r) => r.value);

      const colors = {
        reps: { border: '#667eea', bg: 'rgba(102, 126, 234, 0.1)' },
        weight: { border: '#f56565', bg: 'rgba(245, 101, 101, 0.1)' },
        duration: { border: '#48bb78', bg: 'rgba(72, 187, 120, 0.1)' },
      } as const;
      const color = colors[chartData.type];

      const existing = this.charts.get(key);
      if (existing) {
        // update in place to avoid flicker
        existing.data.labels = labels;
        existing.data.datasets[0].data = data as any;
        (existing.data.datasets[0] as any).label = chartData.label;
        existing.update();
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const config: ChartConfiguration = {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: chartData.label,
              data,
              borderColor: color.border,
              backgroundColor: color.bg,
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: color.border,
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `${chartData.label}: ${ctx.parsed.y}`,
              },
            },
          },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } },
          },
        },
      };

      const chart = new Chart(ctx, config);
      this.charts.set(key, chart);
    });
  }

  private destroyAllCharts() {
    this.charts.forEach((c) => {
      try {
        c.destroy();
      } catch {}
    });
    this.charts.clear();
  }
}
