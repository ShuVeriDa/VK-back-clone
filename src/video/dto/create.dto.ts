import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVideoDto {
  @IsNotEmpty()
  @IsString()
  videoUrl: string;

  @IsOptional()
  @IsString()
  communityId?: string;
}
