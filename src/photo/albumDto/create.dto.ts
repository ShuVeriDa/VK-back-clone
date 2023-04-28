import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateAlbumDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string | null;

  @IsOptional()
  @IsString()
  turnOffWatching: 'me' | 'friends' | 'all';
}
