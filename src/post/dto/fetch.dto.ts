import { IsOptional, IsString } from 'class-validator';

export class FetchPostDto {
  @IsOptional()
  @IsString()
  communityId: string;
}
