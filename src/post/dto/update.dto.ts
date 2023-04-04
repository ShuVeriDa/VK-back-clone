import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
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

  @IsBoolean()
  @IsOptional()
  turnOffComments?: boolean;

  @IsOptional()
  @IsString()
  communityId?: string;
}
