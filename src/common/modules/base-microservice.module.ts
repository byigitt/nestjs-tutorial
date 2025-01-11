import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { EventsModule } from '../events/events.module';
import { QueueModule } from '../queues/queue.module';
import { HealthModule } from '../health/health.module';

@Module({})
export class BaseMicroserviceModule {
  static register(): DynamicModule {
    return {
      module: BaseMicroserviceModule,
      imports: [ConfigModule, EventsModule, QueueModule, HealthModule],
      exports: [ConfigModule, EventsModule, QueueModule, HealthModule],
      global: true,
    };
  }
}
