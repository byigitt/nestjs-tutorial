import { Injectable, OnModuleInit } from '@nestjs/common';
import { CacheEventEmitter, CacheEventType } from './cache.events';

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  expirations: number;
  errors: number;
  hitRate: number;
  size: number;
  lastReset: Date;
}

@Injectable()
export class CacheStatsService implements OnModuleInit {
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    expirations: 0,
    errors: 0,
    hitRate: 0,
    size: 0,
    lastReset: new Date(),
  };

  constructor(private readonly eventEmitter: CacheEventEmitter) {}

  onModuleInit() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.eventEmitter.onEvent().subscribe((event) => {
      switch (event.type) {
        case CacheEventType.GET:
          if (event.metadata?.hit) {
            this.stats.hits++;
          } else {
            this.stats.misses++;
          }
          break;
        case CacheEventType.SET:
          this.stats.sets++;
          this.stats.size++;
          break;
        case CacheEventType.DELETE:
          this.stats.deletes++;
          this.stats.size = Math.max(0, this.stats.size - 1);
          break;
        case CacheEventType.EXPIRED:
          this.stats.expirations++;
          this.stats.size = Math.max(0, this.stats.size - 1);
          break;
        case CacheEventType.ERROR:
          this.stats.errors++;
          break;
      }
      this.updateHitRate();
    });
  }

  private updateHitRate() {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      expirations: 0,
      errors: 0,
      hitRate: 0,
      size: 0,
      lastReset: new Date(),
    };
  }
}
