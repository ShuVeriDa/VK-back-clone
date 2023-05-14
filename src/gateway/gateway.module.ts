import { Module } from '@nestjs/common';
import { MyGateway } from './gatewaty';

@Module({
  providers: [MyGateway],
})
export class GatewayModule {}
