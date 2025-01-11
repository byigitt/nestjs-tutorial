import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

export enum CacheEventType {
  SET = 'set',
  GET = 'get',
  DELETE = 'delete',
  CLEAR = 'clear',
  EXPIRED = 'expired',
  ERROR = 'error',
}

export interface CacheEvent<T = any> {
  type: CacheEventType;
  key?: string;
  value?: T;
  timestamp: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class CacheEventEmitter {
  private eventSubject = new Subject<CacheEvent>();

  emit<T>(event: Omit<CacheEvent<T>, 'timestamp'>) {
    this.eventSubject.next({
      ...event,
      timestamp: Date.now(),
    });
  }

  onEvent(): Observable<CacheEvent> {
    return this.eventSubject.asObservable();
  }

  onEventType(type: CacheEventType): Observable<CacheEvent> {
    return new Observable((subscriber) => {
      return this.eventSubject.subscribe((event) => {
        if (event.type === type) {
          subscriber.next(event);
        }
      });
    });
  }
}
