export interface ExerciseTypeDto {
  id: string;
  name: string;
  description?: string;
  measuresReps?: boolean;
  measuresWeight?: boolean;
  measuresTime?: boolean;
}
