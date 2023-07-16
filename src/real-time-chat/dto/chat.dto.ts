import { IsNumber, IsString } from 'class-validator';

export class ChatDto {
  @IsString()
  content: string;

  @IsNumber()
  senderId: number;

  @IsNumber()
  receiverId: number;
}
