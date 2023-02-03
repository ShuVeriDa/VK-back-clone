import { IsOptional, IsString } from 'class-validator';

export class UpdateMusicDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  artist?: string;

  @IsString()
  musicUrl: string;

  @IsOptional()
  @IsString()
  communityId?: string;
}
