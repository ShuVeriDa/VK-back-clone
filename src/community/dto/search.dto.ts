import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchCommunityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string | null;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  take?: number;
}
