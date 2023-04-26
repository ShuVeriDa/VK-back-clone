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
import { PhotoEntity } from './photo.entity';
import { UserEntity } from '../../user/entity/user.entity';

@Entity('album')
export class AlbumEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string | null;
  //
  @ManyToOne(() => UserEntity, { eager: true, nullable: false })
  user: UserEntity;

  @Column({ type: 'jsonb', nullable: true })
  photos: PhotoEntity[];

  // @ManyToOne(() => CommunityEntity, (community) => community.photos)
  // community: CommunityEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
