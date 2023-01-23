import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostEntity } from '../../post/entity/post.entity';
import { UserEntity } from '../../user/entity/user.entity';

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

  @Column({ default: false })
  isAdmin: boolean;

  @OneToMany(() => PostEntity, (post) => post.community)
  posts: PostEntity[];

  @ManyToMany(() => UserEntity, (user) => user.communities, {
    eager: true,
    nullable: false,
  })
  // @JoinTable()
  @JoinColumn({ name: 'memberId' })
  members: UserEntity[];

  @ManyToOne(() => UserEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'authorId' })
  author: UserEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
