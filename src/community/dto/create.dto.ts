import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserEntity } from '../../user/entity/user.entity';

export class CreateCommunityDto {
  @IsString()
  @MinLength(3, {
    message: 'Password cannot be less than 3 characters',
  })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string | null;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @IsOptional()
  @IsString()
  @IsArray()
  members?: UserEntity[];

  @IsOptional()
  @IsString()
  author?: { id: string };
}
