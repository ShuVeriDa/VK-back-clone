import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { UserEntity } from '../../user/entity/user.entity';

export class CreateCommunityDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string | null;

  @IsOptional()
  @IsString()
  imageUrl?: string;

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
