import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RealtimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column()
  senderId: number;

  @Column()
  receiverId: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
