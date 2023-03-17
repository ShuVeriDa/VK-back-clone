import { IsNotEmpty } from 'class-validator';

export class FriendDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  friendId: string;
}
