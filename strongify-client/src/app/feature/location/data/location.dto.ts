export interface LocationDto {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  // optional image url stored on the server
  imageUrl?: string;
}

export interface CreateLocationDto {
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  imageUrl?: string;
}

export type UpdateLocationDto = Partial<CreateLocationDto>;

export interface ExerciseTypeDto {
  id: string;
  name: string;
  description?: string;
  measuresReps?: boolean;
  measuresWeight?: boolean;
}

export interface CreateRecordDto {
  location: { id: string };
  exerciseType: { id: string };
  reps?: number;
  weightKg?: number;
  durationSec?: number;
  rpe?: number;
  notes?: string;
}
