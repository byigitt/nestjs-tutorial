import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { NotificationModule } from './notification.module';
import { microservicesConfig } from '../../config/microservices.config';

async function bootstrap() {
  const logger = new Logger('NotificationService');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationModule,
    microservicesConfig.notification,
  );

  await app.listen();
  logger.log('Notification Microservice is listening');
}

bootstrap();
