import { IsString } from 'class-validator';

export class AddPhotoToAlbum {
  @IsString()
  photoId: string;
}
