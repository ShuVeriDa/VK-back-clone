import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchCommunityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  take?: number;
}
