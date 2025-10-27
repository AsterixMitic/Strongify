import { Module } from '@nestjs/common';
import { ExerciseTypeService } from './exercise-type.service';
import { ExerciseTypeController } from './exercise-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseType } from './exercise-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseType])],
  controllers: [ExerciseTypeController],
  providers: [ExerciseTypeService],
    exports: [ExerciseTypeService],
})
export class ExerciseTypeModule {}
