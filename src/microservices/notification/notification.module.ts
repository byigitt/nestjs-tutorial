import { Module } from '@nestjs/common';
import { BaseMicroserviceModule } from '../../common/modules/base-microservice.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { ConfigModule } from '../../config/config.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '../../config/config.service';

@Module({
  imports: [
    BaseMicroserviceModule.register(),
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.smtpHost,
          port: configService.smtpPort,
          auth: {
            user: configService.smtpUser,
            pass: configService.smtpPass,
          },
        },
        defaults: {
          from: configService.smtpFrom,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
