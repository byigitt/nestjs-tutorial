import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  // Server Configuration
  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  // Database Configuration
  get mongodbUri(): string {
    return this.configService.get<string>('MONGODB_URI');
  }

  // Redis Configuration
  get redisHost(): string {
    return this.configService.get<string>('REDIS_HOST', 'localhost');
  }

  get redisPort(): number {
    return this.configService.get<number>('REDIS_PORT', 6379);
  }

  // JWT Configuration
  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET');
  }

  get jwtExpiration(): string {
    return this.configService.get<string>('JWT_EXPIRATION', '1d');
  }

  // Rate Limiting
  get rateLimitTtl(): number {
    return this.configService.get<number>('RATE_LIMIT_TTL', 60);
  }

  get rateLimitMax(): number {
    return this.configService.get<number>('RATE_LIMIT_MAX', 100);
  }

  // WebSocket Configuration
  get wsPort(): number {
    return this.configService.get<number>('WS_PORT', 3001);
  }

  get wsPath(): string {
    return this.configService.get<string>('WS_PATH', '/notifications');
  }

  get wsCorsOrigin(): string {
    return this.configService.get<string>('WS_CORS_ORIGIN', '*');
  }

  // Email Configuration
  get smtpHost(): string {
    return this.configService.get<string>('SMTP_HOST');
  }

  get smtpPort(): number {
    return this.configService.get<number>('SMTP_PORT', 587);
  }

  get smtpUser(): string {
    return this.configService.get<string>('SMTP_USER');
  }

  get smtpPass(): string {
    return this.configService.get<string>('SMTP_PASS');
  }

  get smtpFrom(): string {
    return this.configService.get<string>('SMTP_FROM');
  }

  // Logging Configuration
  get logLevel(): string {
    return this.configService.get<string>('LOG_LEVEL', 'debug');
  }

  get logFormat(): string {
    return this.configService.get<string>('LOG_FORMAT', 'combined');
  }

  // API Documentation
  get swaggerTitle(): string {
    return this.configService.get<string>(
      'SWAGGER_TITLE',
      'NestJS Tutorial API',
    );
  }

  get swaggerDescription(): string {
    return this.configService.get<string>(
      'SWAGGER_DESCRIPTION',
      'A comprehensive NestJS API with all the bells and whistles',
    );
  }

  get swaggerVersion(): string {
    return this.configService.get<string>('SWAGGER_VERSION', '1.0');
  }

  get swaggerPath(): string {
    return this.configService.get<string>('SWAGGER_PATH', 'docs');
  }

  // Health Check Configuration
  get healthCheckToken(): string {
    return this.configService.get<string>('HEALTH_CHECK_TOKEN');
  }

  // GraphQL Configuration
  get graphqlPlayground(): boolean {
    return this.configService.get<boolean>('GRAPHQL_PLAYGROUND', true);
  }

  get graphqlDebug(): boolean {
    return this.configService.get<boolean>('GRAPHQL_DEBUG', true);
  }

  get graphqlSchemaPath(): string {
    return this.configService.get<string>('GRAPHQL_SCHEMA_PATH', 'schema.gql');
  }

  get graphqlSortSchema(): boolean {
    return this.configService.get<boolean>('GRAPHQL_SORT_SCHEMA', true);
  }

  get graphqlIntrospection(): boolean {
    return this.configService.get<boolean>('GRAPHQL_INTROSPECTION', true);
  }
}
