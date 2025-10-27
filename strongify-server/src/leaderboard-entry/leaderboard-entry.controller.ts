import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LeaderboardEntryService } from './leaderboard-entry.service';
import { CreateLeaderboardEntryDto } from './dto/create-leaderboard-entry.dto';
import { UpdateLeaderboardEntryDto } from './dto/update-leaderboard-entry.dto';

@Controller('leaderboard-entry')
export class LeaderboardEntryController {
  constructor(private readonly leaderboardEntryService: LeaderboardEntryService) {}

  @Post()
  create(@Body() createLeaderboardEntryDto: CreateLeaderboardEntryDto) {
    return this.leaderboardEntryService.create(createLeaderboardEntryDto);
  }

  @Get()
  findAll() {
    return this.leaderboardEntryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaderboardEntryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeaderboardEntryDto: UpdateLeaderboardEntryDto) {
    return this.leaderboardEntryService.update(id, updateLeaderboardEntryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaderboardEntryService.remove(id);
  }
}
