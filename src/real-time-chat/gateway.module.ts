import { Module } from '@nestjs/common';
import { SocketGateway } from './gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealtimeEntity } from './entity/realtime.entity';
import { UserEntity } from '../user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RealtimeEntity, UserEntity])],
  providers: [SocketGateway],
})
export class GatewayModule {}
