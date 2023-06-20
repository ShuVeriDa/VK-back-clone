import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMusicDto {
  @IsNotEmpty()
  @IsString()
  musicUrl: string;

  @IsOptional()
  @IsString()
  communityId?: string;
}
