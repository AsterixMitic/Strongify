import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutRecordService } from './workout-record.service';

describe('WorkoutRecordService', () => {
  let service: WorkoutRecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkoutRecordService],
    }).compile();

    service = module.get<WorkoutRecordService>(WorkoutRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
