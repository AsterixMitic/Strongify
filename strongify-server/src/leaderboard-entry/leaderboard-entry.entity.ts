import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, Index
} from 'typeorm';
import { User } from 'src/user/user.entity';
import { ExerciseType } from 'src/exercise-type/exercise-type.entity';

@Entity('leaderboard_entries')
@Index('idx_leaderboard_exercise', ['exerciseType', 'score'])
export class LeaderboardEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.leaderboardEntries, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  @ManyToOne(() => ExerciseType, (t) => t.leaderboardEntries, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  exerciseType: ExerciseType;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  score: number;

  @Column({ type: 'varchar', length: 50 })
  metric: string; // npr. "weight" | "reps" | "duration"

  @Column({ type: 'int' })
  rank: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
