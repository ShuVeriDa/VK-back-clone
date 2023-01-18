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

  @Column({ default: false })
  isAdmin?: boolean;

  @OneToMany(() => PostEntity, (post) => post.user, {
    eager: false,
    nullable: true,
  })
  posts: PostEntity[];

  @ManyToMany(() => PostEntity)
  @JoinTable()
  reposts: PostEntity[];

  @ManyToMany(() => PostEntity)
  @JoinTable()
  favorites: PostEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
