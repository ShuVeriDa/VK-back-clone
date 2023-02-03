import { IsOptional, IsString } from 'class-validator';

export class UpdateMusicDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  artist?: string;

  @IsOptional()
  @IsString()
  communityId?: string;
}
