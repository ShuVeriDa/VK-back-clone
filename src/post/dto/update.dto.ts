import { IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  text?: string;

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
