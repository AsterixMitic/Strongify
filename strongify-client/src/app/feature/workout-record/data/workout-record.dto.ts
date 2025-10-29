import { ExerciseTypeDto } from '../../location/data/location.dto';

export interface WorkoutRecordDto {
  id?: string;
  userId?: string;
  locationId?: string;
  exercise?: string;
  value?: number;
  createdAt?: string;
  exerciseType?: ExerciseTypeDto;
  reps?: number;
  weightKg?: number;
  durationSec?: number;
  user?: any;
  location?: any;
}
