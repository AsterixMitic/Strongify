import { Module } from '@nestjs/common';
import { LeaderboardEntryService } from './leaderboard-entry.service';
import { LeaderboardEntryController } from './leaderboard-entry.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardEntry } from './leaderboard-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaderboardEntry])],
  controllers: [LeaderboardEntryController],
  providers: [LeaderboardEntryService],
  exports: [LeaderboardEntryService],
})
export class LeaderboardEntryModule {}
