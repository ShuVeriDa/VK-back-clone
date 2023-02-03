import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';

@Entity('music')
export class MusicEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'Без названия' })
  title: string;

  @Column({ default: 'Неизвестен' })
  artist: string;

  @Column()
  musicUrl: string;

  @ManyToOne(() => UserEntity, { eager: true, nullable: false })
  // @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToMany(() => UserEntity, (user) => user.music, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'musicAddersId' })
  musicAdders: UserEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
