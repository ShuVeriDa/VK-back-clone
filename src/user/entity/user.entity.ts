import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostEntity } from '../../post/entity/post.entity';
import { CommentEntity } from '../../comment/entity/comment.entity';
import { FriendEntity } from '../../../archive/friend/entity/friend.entity';
import { CommunityEntity } from '../../community/entity/community.entity';
import { MusicEntity } from '../../music/entity/music.entity';
import { PhotoEntity } from '../../photo/entity/photo.entity';
import { VideoEntity } from '../../video/entity/video.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    default: '',
  })
  avatar?: string;

  @Column({
    default: '',
  })
  status?: string;

  @Column({
    default: 'Соьлжа-Г1ала',
  })
  location?: string;

  @Column({ default: false })
  isAdmin?: boolean;

  @OneToMany(() => PostEntity, (post) => post.user, {
    eager: false,
    nullable: true,
  })
  posts: PostEntity[];

  @OneToMany(() => PhotoEntity, (photo) => photo.user, {
    eager: false,
    nullable: true,
  })
  photos: PhotoEntity[];

  @ManyToMany(() => PostEntity)
  @JoinTable()
  reposts: PostEntity[];

  @ManyToMany(() => PostEntity)
  @JoinTable()
  favorites: PostEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user, {
    eager: false,
    nullable: true,
  })
  comments: CommentEntity[];

  // @OneToMany(() => FriendEntity, (friend) => friend.user, {
  //   eager: false,
  //   nullable: true,
  // })
  // friends: FriendEntity[];

  @ManyToMany(() => UserEntity, (user) => user.friends, {
    nullable: true,
  })
  @JoinTable()
  friends: UserEntity[];

  @ManyToMany(() => CommunityEntity, (community) => community.members)
  @JoinTable()
  communities: CommunityEntity[];

  @ManyToMany(() => MusicEntity, (music) => music.musicAdders)
  @JoinTable()
  music: MusicEntity[];

  @ManyToMany(() => VideoEntity, (video) => video.videoAdders)
  @JoinTable()
  video: VideoEntity[];

  // @OneToMany(() => MusicEntity, (music) => music.user, {
  //   eager: false,
  //   nullable: true,
  // })
  // music: MusicEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
