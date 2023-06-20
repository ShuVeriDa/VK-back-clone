import { IsOptional, IsString } from 'class-validator';

export class FetchMusicDto {
  @IsString()
  communityId: string;
}
