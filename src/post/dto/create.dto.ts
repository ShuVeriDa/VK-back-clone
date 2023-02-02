import { IsOptional, IsString } from 'class-validator';
import { Column, IsNull } from 'typeorm';

export class CreatePostDto {
  @IsString()
  text: string;

  @IsString()
  @IsOptional()
  imageUrl?: string | null;

  @IsString()
  @IsOptional()
  musicUrl?: string | null;

  @IsString()
  @IsOptional()
  videoUrl?: string | null;

  @IsOptional()
  @IsString()
  communityId?: string;
}
