import { Module } from '@nestjs/common';
import { WorkoutRecordService } from './workout-record.service';
import { WorkoutRecordController } from './workout-record.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutRecord } from './workout-record.entity';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutRecord])],
  controllers: [WorkoutRecordController],
  providers: [WorkoutRecordService, RealtimeGateway],
  exports: [WorkoutRecordService],
})
export class WorkoutRecordModule {}
