import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { CommunityEntity } from '../../community/entity/community.entity';

@Entity('video')
export class VideoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  videoUrl: string;

  @ManyToOne(() => UserEntity, { eager: true, nullable: false })
  user: UserEntity;

  @ManyToMany(() => UserEntity, (user) => user.video, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'videoAddersId' })
  videoAdders: UserEntity[];

  @ManyToMany(() => CommunityEntity, (community) => community.video)
  @JoinColumn({ name: 'communityId' })
  communities: CommunityEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
