import { IsOptional, IsString } from 'class-validator';

export class UpdatePhotoDto {
  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  communityId?: string;
}
