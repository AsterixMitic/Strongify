import { PartialType } from '@nestjs/swagger';
import { CreateWorkoutRecordDto } from './create-workout-record.dto';

export class UpdateWorkoutRecordDto extends PartialType(CreateWorkoutRecordDto) {}
