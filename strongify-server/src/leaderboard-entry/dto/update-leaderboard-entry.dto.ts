import { PartialType } from '@nestjs/swagger';
import { CreateLeaderboardEntryDto } from './create-leaderboard-entry.dto';

export class UpdateLeaderboardEntryDto extends PartialType(CreateLeaderboardEntryDto) {}
