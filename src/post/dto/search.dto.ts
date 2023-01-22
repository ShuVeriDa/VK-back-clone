import { IsOptional, IsString } from 'class-validator';

export class SearchPostDto {
  @IsString()
  @IsOptional()
  text?: string;

  limit?: number;
  take?: number;

  views?: 'DESC' | 'ASC';

  favorites?: 'DESC' | 'ASC';
  rating?: 'DESC' | 'ASC';
}
