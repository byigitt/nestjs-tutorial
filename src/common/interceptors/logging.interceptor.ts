import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;
          this.logger.log(
            `${method} ${url} ${response.statusCode} ${delay}ms - Request: ${JSON.stringify(
              body,
            )} - Response: ${JSON.stringify(data)}`,
          );
        },
        error: (error: any) => {
          const delay = Date.now() - now;
          this.logger.error(
            `${method} ${url} ${error.status} ${delay}ms - Request: ${JSON.stringify(
              body,
            )} - Error: ${JSON.stringify(error.message)}`,
          );
        },
      }),
    );
  }
}
