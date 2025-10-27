import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeaderboardEntryDto } from './dto/create-leaderboard-entry.dto';
import { UpdateLeaderboardEntryDto } from './dto/update-leaderboard-entry.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaderboardEntry } from './leaderboard-entry.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LeaderboardEntryService {
  
    constructor(
      @InjectRepository(LeaderboardEntry)
      private repo: Repository<LeaderboardEntry>
    ){
    }
  
  
    async create(createLeaderboardEntryDto: CreateLeaderboardEntryDto): Promise<LeaderboardEntry> {
      const leaderboardEntry = this.repo.create(createLeaderboardEntryDto);
      return this.repo.save(leaderboardEntry);
    }
  
    async findAll(): Promise<LeaderboardEntry[]> {
      return this.repo.find();
    }
  
    async findOne(id: string): Promise<LeaderboardEntry> {
      const leaderboardEntry = await this.repo.findOne({ where: { id } });
  
      if (!leaderboardEntry) {
        throw new NotFoundException('LeaderboardEntry not found');
      }
  
      return leaderboardEntry;
    }
  
    async update(id: string, updateLeaderboardEntryDto: UpdateLeaderboardEntryDto): Promise<LeaderboardEntry> {
      const leaderboardEntry = await this.findOne(id);
      await this.repo.update(id, updateLeaderboardEntryDto);
      return this.findOne(id);
    }
  
  
    async remove(id: string): Promise<void> {
      const leaderboardEntry = await this.findOne(id);
      await this.repo.remove(leaderboardEntry);
    }
  }
