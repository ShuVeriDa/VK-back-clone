import { ArrayNotEmpty, ArrayUnique, IsArray, IsString } from 'class-validator';

export class AddMusicToPlaylistDto {
  @IsArray()
  // @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  musicIds: string[];
}
