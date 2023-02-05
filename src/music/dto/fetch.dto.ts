import { IsOptional, IsString } from 'class-validator';

export class FetchMusicDto {
  @IsOptional()
  @IsString()
  communityId: string;
}
