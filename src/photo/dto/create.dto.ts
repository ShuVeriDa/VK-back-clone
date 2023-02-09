import { IsOptional, IsString } from 'class-validator';

export class CreatePhotoDto {
  @IsString()
  photoUrl: string;

  @IsOptional()
  @IsString()
  communityId?: string;
}
