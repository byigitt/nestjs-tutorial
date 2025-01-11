import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { microservicesConfig } from '../../config/microservices.config';

async function bootstrap() {
  const logger = new Logger('Auth Microservice');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    microservicesConfig.auth,
  );

  await app.listen();
  logger.log(
    `Auth Microservice is listening on ${microservicesConfig.auth.options.host}:${microservicesConfig.auth.options.port}`,
  );
}

bootstrap();
