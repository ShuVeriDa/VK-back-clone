import { IsOptional, IsString } from 'class-validator';
import { CreateAlbumDto } from './create.dto';

export class UpdateAlbumDto extends CreateAlbumDto {
  @IsString()
  @IsOptional()
  title: string;
}
