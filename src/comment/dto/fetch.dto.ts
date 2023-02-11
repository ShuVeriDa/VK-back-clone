import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FetchCommentDto {
  @IsString()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  photoId: string;

  @IsOptional()
  @IsString()
  communityId?: string;
}
