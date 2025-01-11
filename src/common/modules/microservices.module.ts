import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { microservicesConfig } from '../../config/microservices.config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: microservicesConfig.user.options,
      },
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: microservicesConfig.auth.options,
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.TCP,
        options: microservicesConfig.notification.options,
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class MicroservicesModule {}
