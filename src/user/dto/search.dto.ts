import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchUserDto {
  @IsOptional()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  take?: number;
}
