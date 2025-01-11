import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { BackgroundProcessor } from './background.processor';
import { QueueService } from './queue.service';
import { NotificationsModule } from '../gateways/notifications.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.redisHost,
          port: configService.redisPort,
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'background-tasks',
    }),
    NotificationsModule,
  ],
  providers: [BackgroundProcessor, QueueService],
  exports: [BullModule, BackgroundProcessor, QueueService],
})
export class QueueModule {}
