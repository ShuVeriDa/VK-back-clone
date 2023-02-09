import { IsOptional, IsString } from 'class-validator';

export class UpdatePhotosDto {
  @IsOptional()
  @IsString()
  description: string;

  @IsString()
  photoUrl: string;

  @IsOptional()
  @IsString()
  communityId?: string;
}
