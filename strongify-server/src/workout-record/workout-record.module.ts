import { Module } from '@nestjs/common';
import { WorkoutRecordService } from './workout-record.service';
import { WorkoutRecordController } from './workout-record.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutRecord } from './workout-record.entity';
import { RealtimeModule } from 'src/realtime/realtime.module';
import { ExerciseTypeModule } from 'src/exercise-type/exercise-type.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutRecord]), ExerciseTypeModule, RealtimeModule],
  controllers: [WorkoutRecordController],
  providers: [WorkoutRecordService],
  exports: [WorkoutRecordService],
})
export class WorkoutRecordModule {}
