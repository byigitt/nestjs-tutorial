import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { CacheService } from '../services/cache.service';
import { CacheStatsService } from '../services/cache.stats';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly cacheStatsService: CacheStatsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyCacheCleanup() {
    this.logger.log('Running daily cache cleanup');
    await this.cacheService.reset();
    this.cacheStatsService.resetStats();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyCacheStats() {
    this.logger.log('Collecting hourly cache statistics');
    const stats = this.cacheStatsService.getStats();
    this.logger.log(`Cache hit rate: ${stats.hitRate}%`);
    this.logger.log(`Cache size: ${stats.size} items`);
  }

  @Interval(300000) // Every 5 minutes
  async handleCacheCompression() {
    this.logger.log('Running cache compression check');
    // Add implementation for checking compression ratios
    // and potentially recompressing items with poor ratios
  }

  @Timeout(5000) // 5 seconds after application startup
  async handleStartup() {
    this.logger.log('Initializing task service');
    // Add any startup tasks here
  }
}
