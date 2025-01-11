import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  SetMetadata,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';
import { Reflector } from '@nestjs/core';

export const CacheTTL = (ttl: number) => SetMetadata('cache_ttl', ttl);
export const CacheKey = (key: string) => SetMetadata('cache_key', key);
export const NoCache = () => SetMetadata('no_cache', true);

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const noCache = this.reflector.get<boolean>(
      'no_cache',
      context.getHandler(),
    );

    if (noCache) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const ttl =
      this.reflector.get<number>('cache_ttl', context.getHandler()) || 60000;
    const customKey = this.reflector.get<string>(
      'cache_key',
      context.getHandler(),
    );

    const key = this.generateCacheKey(request, customKey);
    const cachedResponse = await this.cacheService.get(key);

    if (cachedResponse) {
      return of(cachedResponse);
    }

    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheService.set(key, response, { ttl });
      }),
    );
  }

  private generateCacheKey(request: any, customKey?: string): string {
    if (customKey) {
      return `route:${customKey}`;
    }

    const { method, url, query, body } = request;
    const queryString = Object.keys(query || {})
      .sort()
      .map((key) => `${key}=${query[key]}`)
      .join('&');

    const bodyString = Object.keys(body || {})
      .sort()
      .map((key) => `${key}=${body[key]}`)
      .join('&');

    return `route:${method}:${url}:${queryString}:${bodyString}`;
  }
}
