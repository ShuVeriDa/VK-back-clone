import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityEntity } from './entity/community.entity';
import { UserEntity } from '../user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommunityEntity, UserEntity])],
  providers: [CommunityService],
  controllers: [CommunityController],
})
export class CommunityModule {}
