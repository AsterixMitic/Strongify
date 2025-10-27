export interface WorkoutRecordDto {
  id?: string;
  userId?: string;
  locationId: string;
  exercise: string;
  value: number;
  createdAt?: string;
}
