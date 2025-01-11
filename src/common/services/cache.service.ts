import { Injectable, OnModuleInit } from '@nestjs/common';
import { CacheEventEmitter, CacheEventType } from './cache.events';
import { CacheCompressionService, CompressedData } from './cache.compression';

interface CacheItem<T> {
  value: T | CompressedData;
  expiresAt: number;
  tags?: string[];
  version?: number;
  lastAccessed?: number;
  hits?: number;
  compressed?: boolean;
  originalSize?: number;
  compressedSize?: number;
}

interface CacheOptions {
  ttl?: number;
  tags?: string[];
  version?: number;
  compress?: boolean;
}

@Injectable()
export class CacheService implements OnModuleInit {
  private cache: Map<string, CacheItem<any>> = new Map();
  private readonly defaultTTL = 60000; // 60 seconds
  private version = 1;

  constructor(
    private readonly eventEmitter: CacheEventEmitter,
    private readonly compressionService: CacheCompressionService,
  ) {}

  onModuleInit() {
    // Start cache cleanup interval
    setInterval(() => this.cleanup(), 60000);
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) {
      this.eventEmitter.emit({
        type: CacheEventType.GET,
        key,
        metadata: { hit: false },
      });
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.eventEmitter.emit({
        type: CacheEventType.EXPIRED,
        key,
      });
      return null;
    }

    // Update stats
    item.lastAccessed = Date.now();
    item.hits = (item.hits || 0) + 1;

    let value = item.value;
    if (item.compressed) {
      try {
        value = await this.compressionService.decompress(
          value as CompressedData,
        );
      } catch (error) {
        this.eventEmitter.emit({
          type: CacheEventType.ERROR,
          key,
          metadata: { error: error.message },
        });
        return null;
      }
    }

    this.eventEmitter.emit({
      type: CacheEventType.GET,
      key,
      value,
      metadata: { hit: true },
    });

    return value as T;
  }

  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {},
  ): Promise<void> {
    try {
      const ttl = options.ttl || this.defaultTTL;
      let storedValue: T | CompressedData = value;
      let compressed = false;
      let originalSize = 0;
      let compressedSize = 0;

      if (options.compress !== false) {
        const stringValue = JSON.stringify(value);
        originalSize = Buffer.byteLength(stringValue);

        if (this.compressionService.shouldCompress(originalSize)) {
          const compressedData = await this.compressionService.compress(value);
          storedValue = compressedData;
          compressed = compressedData.compressed;
          compressedSize = compressedData.compressedSize;
        }
      }

      this.cache.set(key, {
        value: storedValue,
        expiresAt: Date.now() + ttl,
        tags: options.tags,
        version: options.version || this.version,
        lastAccessed: Date.now(),
        hits: 0,
        compressed,
        originalSize,
        compressedSize,
      });

      this.eventEmitter.emit({
        type: CacheEventType.SET,
        key,
        value,
        metadata: {
          ttl,
          tags: options.tags,
          compressed,
          originalSize,
          compressedSize,
        },
      });
    } catch (error) {
      this.eventEmitter.emit({
        type: CacheEventType.ERROR,
        key,
        metadata: { error: error.message },
      });
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
    this.eventEmitter.emit({
      type: CacheEventType.DELETE,
      key,
    });
  }

  async reset(): Promise<void> {
    this.cache.clear();
    this.version++;
    this.eventEmitter.emit({
      type: CacheEventType.CLEAR,
    });
  }

  async has(key: string): Promise<boolean> {
    const item = await this.get(key);
    return item !== null;
  }

  async remember<T>(
    key: string,
    ttl: number,
    callback: () => Promise<T>,
  ): Promise<T> {
    const existing = await this.get<T>(key);
    if (existing !== null) {
      return existing;
    }

    try {
      const value = await callback();
      await this.set(key, value, { ttl });
      return value;
    } catch (error) {
      this.eventEmitter.emit({
        type: CacheEventType.ERROR,
        key,
        metadata: { error: error.message },
      });
      throw error;
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    for (const [key, item] of this.cache.entries()) {
      if (item.tags?.includes(tag)) {
        await this.del(key);
      }
    }
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        await this.del(key);
      }
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        this.eventEmitter.emit({
          type: CacheEventType.EXPIRED,
          key,
        });
      }
    }
  }
}
