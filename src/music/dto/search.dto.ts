import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchMusicDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  artist?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  take?: number;
}
