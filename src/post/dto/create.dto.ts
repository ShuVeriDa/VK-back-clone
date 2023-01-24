import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  communityId?: string;
}
