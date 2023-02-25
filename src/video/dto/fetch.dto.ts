import { IsOptional, IsString } from 'class-validator';

export class FetchVideoDto {
  @IsString()
  communityId: string;
}
