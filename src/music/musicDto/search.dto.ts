import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchMusicDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  artist?: string;

  // @IsOptional()
  // @IsString()
  // titleOrder?: 'DESC' | 'ASC';

  @IsOptional()
  @IsBoolean()
  isOtherMusic: boolean;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  take?: number;
}
