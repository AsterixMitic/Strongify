import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExerciseTypeDto } from './dto/create-exercise-type.dto';
import { UpdateExerciseTypeDto } from './dto/update-exercise-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ExerciseType } from './exercise-type.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ExerciseTypeService {
  
    constructor(
      @InjectRepository(ExerciseType)
      private repo: Repository<ExerciseType>
    ){
    }
  
  
    async create(createExerciseTypeDto: CreateExerciseTypeDto): Promise<ExerciseType> {
      const exerciseType = this.repo.create(createExerciseTypeDto);
      return this.repo.save(exerciseType);
    }
  
    async findAll(): Promise<ExerciseType[]> {
      return this.repo.find();
    }
  
    async findOne(id: string): Promise<ExerciseType> {
      const exerciseType = await this.repo.findOne({ where: { id } });
  
      if (!exerciseType) {
        throw new NotFoundException('ExerciseType not found');
      }
  
      return exerciseType;
    }
  
    async update(id: string, updateExerciseTypeDto: UpdateExerciseTypeDto): Promise<ExerciseType> {
      const exerciseType = await this.findOne(id);
      await this.repo.update(id, updateExerciseTypeDto);
      return this.findOne(id);
    }
  
  
    async remove(id: string): Promise<void> {
      const exerciseType = await this.findOne(id);
      await this.repo.remove(exerciseType);
    }
}
