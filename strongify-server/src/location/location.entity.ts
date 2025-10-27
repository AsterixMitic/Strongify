import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { WorkoutRecord } from '../workout-record/workout-record.entity';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'latitude', type: 'numeric', precision: 9, scale: 6 })
  latitude: number;

  @Column({ name: 'longitude', type: 'numeric', precision: 9, scale: 6 })
  longitude: number;

  // DB uses `description` column
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string | null;

  // image URL in DB
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => WorkoutRecord, workoutRecord => workoutRecord.location)
  workoutRecords: WorkoutRecord[];
}
