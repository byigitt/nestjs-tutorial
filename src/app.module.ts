import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from './config/config.service';
import {
  ThrottlerModule,
  ThrottlerModuleOptions,
  ThrottlerGuard,
} from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER, APP_PIPE } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TasksModule } from './common/tasks/tasks.module';
import { HealthModule } from './common/health/health.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { NotificationsModule } from './common/gateways/notifications.module';
import { QueueModule } from './common/queues/queue.module';
import { GraphqlModule } from './common/graphql/graphql.module';
import { EventsModule } from './common/events/events.module';
import { MicroservicesModule } from './common/modules/microservices.module';

@Module({
  imports: [
    // Configuration
    ConfigModule,

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.mongodbUri,
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<ThrottlerModuleOptions> => ({
        throttlers: [
          {
            ttl: configService.rateLimitTtl,
            limit: configService.rateLimitMax,
          },
        ],
      }),
      inject: [ConfigService],
    }),

    // Feature Modules
    UsersModule,
    AuthModule,
    TasksModule,
    HealthModule,
    NotificationsModule,
    QueueModule,
    GraphqlModule,
    EventsModule,
    MicroservicesModule,
  ],
  providers: [
    // Guards
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    // Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },

    // Filters
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

    // Pipes
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
