import { IsOptional, IsString } from 'class-validator';

export class CreateMusicDto {
  @IsString()
  musicUrl: string;

  @IsOptional()
  @IsString()
  communityId?: string;
}
