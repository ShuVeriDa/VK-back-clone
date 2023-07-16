import { Module } from '@nestjs/common';
import { SocketGateway } from './gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealtimeEntity } from './entity/realtime.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RealtimeEntity])],
  providers: [SocketGateway],
})
export class GatewayModule {}
