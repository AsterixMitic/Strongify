import { Module } from '@nestjs/common';
import { WorkoutRecordService } from './workout-record.service';
import { WorkoutRecordController } from './workout-record.controller';

@Module({
  controllers: [WorkoutRecordController],
  providers: [WorkoutRecordService],
})
export class WorkoutRecordModule {}
