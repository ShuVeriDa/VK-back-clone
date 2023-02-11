import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FetchCommentDto {
  @IsOptional()
  @IsString()
  postId?: string;

  @IsOptional()
  @IsString()
  photoId?: string;

  @IsOptional()
  @IsString()
  communityId?: string;
}
