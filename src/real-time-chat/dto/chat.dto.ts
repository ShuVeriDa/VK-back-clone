import { IsNumber, IsString } from 'class-validator';

export class ChatDto {
  @IsString()
  message: string;

  // @IsNumber()
  // senderId: number;

  @IsString()
  receiverId: string;
}
