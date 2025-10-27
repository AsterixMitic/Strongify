import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkoutRecordDto } from './dto/create-workout-record.dto';
import { UpdateWorkoutRecordDto } from './dto/update-workout-record.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkoutRecord } from './workout-record.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WorkoutRecordService {
  
    constructor(
      @InjectRepository(WorkoutRecord)
      private repo: Repository<WorkoutRecord>
    ){
    }
  
  
    async create(createWorkoutRecordDto: CreateWorkoutRecordDto): Promise<WorkoutRecord> {
      const workoutRecord = this.repo.create(createWorkoutRecordDto);
      return this.repo.save(workoutRecord);
    }
  
    async findAll(): Promise<WorkoutRecord[]> {
      return this.repo.find();
    }
  
    async findOne(id: string): Promise<WorkoutRecord> {
      const workoutRecord = await this.repo.findOne({ where: { id } });
  
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
