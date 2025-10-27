import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WorkoutRecordService } from './workout-record.service';
import { CreateWorkoutRecordDto } from './dto/create-workout-record.dto';
import { UpdateWorkoutRecordDto } from './dto/update-workout-record.dto';

@Controller('workout-record')
export class WorkoutRecordController {
  constructor(private readonly workoutRecordService: WorkoutRecordService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Req() req: Request, @Body() createWorkoutRecordDto: CreateWorkoutRecordDto) {
    // attach authenticated user id server-side to prevent trusting client
    const user = (req as any).user;
    if (user && user.userId) {
      // ensure relation is set using id only
      (createWorkoutRecordDto as any).user = { id: user.userId };
    }
    return this.workoutRecordService.create(createWorkoutRecordDto);
  }

  @Get()
  findAll() {
    return this.workoutRecordService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workoutRecordService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkoutRecordDto: UpdateWorkoutRecordDto) {
    return this.workoutRecordService.update(id, updateWorkoutRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workoutRecordService.remove(id);
  }
}
