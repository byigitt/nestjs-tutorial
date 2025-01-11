import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { ConfigModule } from '../../config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
