import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePlaylistDto {
  @IsString()
  @MinLength(3, {
    message: 'The minimum length must be more than 3 characters',
  })
  title: string;

  @IsOptional()
  @IsString()
  @MinLength(3, {
    message: 'The minimum length must be more than 3 characters',
  })
  description?: string;

  @IsOptional()
  @IsString()
  coverUrl: string;
}
