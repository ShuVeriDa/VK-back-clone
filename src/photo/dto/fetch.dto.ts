import { IsOptional, IsString } from 'class-validator';

export class FetchPhotoDto {
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsString()
  communityId: string;
}
