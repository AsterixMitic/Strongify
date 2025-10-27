import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkoutRecordDto } from './dto/create-workout-record.dto';
import { UpdateWorkoutRecordDto } from './dto/update-workout-record.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkoutRecord } from './workout-record.entity';
import { Repository } from 'typeorm';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class WorkoutRecordService {
  
    constructor(
      @InjectRepository(WorkoutRecord)
      private repo: Repository<WorkoutRecord>,
      private realtime: RealtimeGateway
      ){
    }
  
  
    async create(createWorkoutRecordDto: CreateWorkoutRecordDto): Promise<WorkoutRecord> {
      const workoutRecord = this.repo.create(createWorkoutRecordDto);
      const saved = await this.repo.save(workoutRecord);
      // emit realtime event for other clients
      try {
        this.realtime.emitRecordCreated(saved);
      } catch (err) {
        // don't block on realtime errors
        console.warn('Realtime emit failed', err);
      }
      return saved;
    }
  
    async findAll(): Promise<WorkoutRecord[]> {
      return this.repo.find({ relations: ['user', 'location', 'exerciseType'] });
    }
  
    async findOne(id: string): Promise<WorkoutRecord> {
      const workoutRecord = await this.repo.findOne({ where: { id }, relations: ['user', 'location', 'exerciseType'] });
  
      if (!workoutRecord) {
        throw new NotFoundException('WorkoutRecord not found');
      }
  
      return workoutRecord;
    }
  
    async update(id: string, updateWorkoutRecordDto: UpdateWorkoutRecordDto): Promise<WorkoutRecord> {
      const workoutRecord = await this.findOne(id);
      await this.repo.update(id, updateWorkoutRecordDto);
      return this.findOne(id);
    }
  
  
    async remove(id: string): Promise<void> {
      const workoutRecord = await this.findOne(id);
      await this.repo.remove(workoutRecord);
    }
  
}
