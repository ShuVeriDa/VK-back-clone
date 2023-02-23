import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { PostEntity } from '../../post/entity/post.entity';
import { PhotoEntity } from '../../photo/entity/photo.entity';
import { VideoEntity } from '../../video/entity/video.entity';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @Column({ default: 0 })
  favorites: number;

  @ManyToOne(() => UserEntity, {
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => PostEntity, {
    nullable: true,
  })
  @JoinColumn({ name: 'postId' })
  post: PostEntity;

  @ManyToOne(() => PhotoEntity, {
    nullable: true,
  })
  @JoinColumn({ name: 'photoId' })
  photo: PhotoEntity;

  @ManyToOne(() => VideoEntity, {
    nullable: true,
  })
  @JoinColumn({ name: 'videoId' })
  video: VideoEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
