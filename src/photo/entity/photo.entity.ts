import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { CommunityEntity } from '../../community/entity/community.entity';
import { CommentEntity } from '../../comment/entity/comment.entity';
import { AlbumEntity } from './album.entity';

@Entity('photos')
export class PhotoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  description: string | null;

  @Column({ nullable: true })
  photoUrl: string | null;

  @Column({
    default: false,
  })
  turnOffComments: boolean;

  @ManyToMany(() => AlbumEntity, (album) => album.photos)
  @JoinTable()
  albums: AlbumEntity[];

  // @OneToMany(() => AlbumEntity, (album) => album.photos, {
  //   nullable: false,
  // })
  // @JoinColumn()
  // albums: AlbumEntity[];

  @ManyToOne(() => UserEntity, { eager: true, nullable: false })
  user: UserEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.photo, { eager: true })
  @JoinColumn()
  comments: CommentEntity[];

  @ManyToOne(() => CommunityEntity, (community) => community.photos)
  community: CommunityEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
