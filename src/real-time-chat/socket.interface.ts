import { UserEntity } from '../user/entity/user.entity';

declare module 'socket.io' {
  interface Socket {
    user: UserEntity; // Replace 'any' with the type of your user object if possible
  }
}
