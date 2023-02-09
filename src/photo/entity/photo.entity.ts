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

@Entity('photos')
export class PhotoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @ManyToOne(() => UserEntity, { eager: true, nullable: false })
  user: UserEntity;

  @ManyToOne(() => CommunityEntity, (community) => community.photos, {
    eager: true,
    nullable: false,
  })
  communities: CommunityEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
