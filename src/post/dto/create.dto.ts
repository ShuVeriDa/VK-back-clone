import { IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  text: string;
}
