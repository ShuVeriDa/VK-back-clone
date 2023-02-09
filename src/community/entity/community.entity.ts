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
import { PostEntity } from '../../post/entity/post.entity';
import { UserEntity } from '../../user/entity/user.entity';
import { MusicEntity } from '../../music/entity/music.entity';
import { PhotoEntity } from '../../photo/entity/photo.entity';

@Entity('communities')
export class CommunityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  imageUrl: string;

  // @Column({ default: false })
  // isAdmin: boolean;

  @OneToMany(() => PostEntity, (post) => post.community)
  posts: PostEntity[];

  @OneToMany(() => PhotoEntity, (photo) => photo.community)
  photos: PostEntity[];

  @ManyToMany(() => UserEntity, (user) => user.communities, {
    eager: true,
    nullable: false,
  })
  // @JoinTable()
  @JoinColumn({ name: 'memberId' })
  members: UserEntity[];

  @ManyToMany(() => UserEntity, (user) => user.communities, {
    eager: true,
    nullable: false,
  })
  @JoinTable({ name: 'adminId' })
  admins: UserEntity[];

  @ManyToMany(() => MusicEntity, (music) => music.communities)
  @JoinTable()
  music: MusicEntity[];

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: UserEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
