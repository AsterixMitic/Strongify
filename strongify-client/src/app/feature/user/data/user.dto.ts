import { WorkoutRecordDto } from "../../workout-record/data/workout-record.dto";

export interface UserDto {
  id: number;
  username: string;
  email: string;
  profileImageUrl: string;
  createdAt: Date;
  workoutRecords: WorkoutRecordDto[];
}