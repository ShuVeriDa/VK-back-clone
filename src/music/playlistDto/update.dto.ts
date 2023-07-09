import {
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateDto {
  @IsString()
  @MinLength(3, {
    message: 'The minimum length must be more than 3 characters',
  })
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsArray()
  // @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  musicIds: string[];
}
