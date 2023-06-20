import { IsString } from 'class-validator';

export class AddMusicToPlaylistDto {
  @IsString()
  musicId: string;
}
