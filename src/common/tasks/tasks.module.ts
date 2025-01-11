import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { CacheModule } from '../services/cache.module';

@Module({
  imports: [ScheduleModule.forRoot(), CacheModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
