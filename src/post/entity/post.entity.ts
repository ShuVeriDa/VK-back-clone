import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { CommentEntity } from '../../comment/entity/comment.entity';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @ManyToOne(() => UserEntity, { eager: true, nullable: false })
  user: UserEntity;

  @Column({
    default: 0,
  })
  views: number;

  @Column({
    default: 0,
  })
  reposts: number;

  @Column({ default: 0 })
  favorites: number;

  @Column({ default: 4.0 })
  rating?: number;

  @OneToMany(() => CommentEntity, (comment) => comment.post, { eager: true })
  @JoinColumn()
  comments: CommentEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
