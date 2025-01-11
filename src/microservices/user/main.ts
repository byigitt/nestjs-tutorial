import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { UserModule } from './user.module';
import { microservicesConfig } from '../../config/microservices.config';

async function bootstrap() {
  const logger = new Logger('UserMicroservice');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserModule,
    microservicesConfig.user,
  );

  await app.listen();
  logger.log(
    `User Microservice is listening on ${microservicesConfig.user.options.host}:${microservicesConfig.user.options.port}`,
  );
}

bootstrap();
