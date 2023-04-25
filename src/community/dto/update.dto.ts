import { CreateCommunityDto } from './create.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCommunityDto extends CreateCommunityDto {
  @IsString()
  @IsOptional()
  @MinLength(3, {
    message: 'Name cannot be less than 3 characters',
  })
  name: string;
}
