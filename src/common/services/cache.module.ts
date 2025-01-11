import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheEventEmitter } from './cache.events';
import { CacheStatsService } from './cache.stats';
import { CacheCompressionService } from './cache.compression';
import { CacheInterceptor } from '../interceptors/cache.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Global()
@Module({
  providers: [
    CacheService,
    CacheEventEmitter,
    CacheStatsService,
    CacheCompressionService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  exports: [
    CacheService,
    CacheEventEmitter,
    CacheStatsService,
    CacheCompressionService,
  ],
})
export class CacheModule {}
