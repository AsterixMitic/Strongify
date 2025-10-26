import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutRecordController } from './workout-record.controller';
import { WorkoutRecordService } from './workout-record.service';

describe('WorkoutRecordController', () => {
  let controller: WorkoutRecordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutRecordController],
      providers: [WorkoutRecordService],
    }).compile();

    controller = module.get<WorkoutRecordController>(WorkoutRecordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
