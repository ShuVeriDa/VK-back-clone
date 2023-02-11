import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  postId: string;

  @IsString()
  @IsOptional()
  photoId: string;

  @IsOptional()
  @IsString()
  communityId?: string;
}
