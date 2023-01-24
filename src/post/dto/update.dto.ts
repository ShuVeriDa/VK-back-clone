import { IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  communityId?: string;
}
