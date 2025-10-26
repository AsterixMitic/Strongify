import { Injectable } from '@nestjs/common';
import { CreateWorkoutRecordDto } from './dto/create-workout-record.dto';
import { UpdateWorkoutRecordDto } from './dto/update-workout-record.dto';

@Injectable()
export class WorkoutRecordService {
  create(createWorkoutRecordDto: CreateWorkoutRecordDto) {
    return 'This action adds a new workoutRecord';
  }

  findAll() {
    return `This action returns all workoutRecord`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workoutRecord`;
  }

  update(id: number, updateWorkoutRecordDto: UpdateWorkoutRecordDto) {
    return `This action updates a #${id} workoutRecord`;
  }

  remove(id: number) {
    return `This action removes a #${id} workoutRecord`;
  }
}
