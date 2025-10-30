import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkoutRecordDto } from './dto/create-workout-record.dto';
import { UpdateWorkoutRecordDto } from './dto/update-workout-record.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkoutRecord } from './workout-record.entity';
import { Repository } from 'typeorm';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { BaseService } from 'src/common/services/base.service';
import { ExerciseType } from 'src/exercise-type/exercise-type.entity';

@Injectable()
export class WorkoutRecordService extends BaseService<WorkoutRecord> {
  
    constructor(
      @InjectRepository(WorkoutRecord)
      private repo: Repository<WorkoutRecord>,
      private realtime: RealtimeGateway
      ){
        super(repo);
    }
  
    async create(createWorkoutRecordDto: CreateWorkoutRecordDto & { user?: { id: number } }): Promise<WorkoutRecord> {
      const workoutRecord = this.repo.create(createWorkoutRecordDto as any);
      const saved = await this.repo.save(workoutRecord) as unknown as WorkoutRecord;
      
      // Load full relations for realtime event
      const fullRecord = await this.repo.findOne({
        where: { id: saved.id },
        relations: ['user', 'location', 'exerciseType']
      });
      
      // emit realtime event for other clients
      try {
        if (fullRecord) {
          this.realtime.emitRecordCreated(fullRecord);
          console.log('Emitted record with full relations:', fullRecord);
        }
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

    async findBestRecordsByExerciseType(exerciseType: ExerciseType, pageNum: number): Promise<WorkoutRecord[]> {

      let valueField = '';
      if(exerciseType.measuresTime){
        valueField = 'durationSec';
      }
      else if(exerciseType.measuresWeight){
        valueField = 'weightKg';
      }
      else if(exerciseType.measuresReps){
        valueField = 'reps';
      }

      const qb = this.repo.createQueryBuilder('workoutRecord')
          .where('workoutRecord.exercise_type_id = :exerciseTypeId', { exerciseTypeId: exerciseType.id })
          .leftJoinAndSelect('workoutRecord.exerciseType', 'exerciseType')
          .leftJoinAndSelect('workoutRecord.user', 'user')
          .leftJoinAndSelect('workoutRecord.location', 'location');

      this.applyPagination(qb, {
        page: pageNum,
        limit: 10,
        orderBy: valueField,
        orderDirection: 'DESC',
      });
      const [entities, total] = await qb.getManyAndCount();
      return entities;
    }
  
}
