import { IsString } from 'class-validator';

export class AddAdminCommunityDto {
  @IsString()
  memberId: string;
}
