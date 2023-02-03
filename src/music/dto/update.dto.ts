import { IsOptional, IsString } from 'class-validator';

export class CreateMusicDto {
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
