import { IsString } from 'class-validator';

export class UpdateMessageDto {
  @IsString()
  message: string;

  @IsString()
  recipientId: string;
}
