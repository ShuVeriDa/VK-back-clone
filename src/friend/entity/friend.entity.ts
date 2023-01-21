import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';

@Entity('friends')
export class FriendEntity {
  // @ManyToOne(() => UserEntity, {
  //   nullable: false,
  // })
  // @JoinColumn({ name: 'userId' })
  // user: UserEntity;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, {
    nullable: false,
  })
  @JoinColumn({ name: 'friendId' })
  friend: UserEntity;

  @ManyToOne(() => UserEntity, {
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
