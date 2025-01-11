import {
  Controller,
  Get,
  Redirect,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiExcludeController,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ConfigService } from './config/config.service';

@ApiExcludeController()
@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @Redirect('docs')
  @ApiOperation({ summary: 'Redirect to API documentation' })
  redirectToDocs() {
    return;
  }

  @Get('api')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get API information' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns API information and status',
  })
  getApiInfo() {
    return {
      name: 'NestJS API',
      version: '1.0.0',
      description: 'Production-ready NestJS API with MongoDB',
      documentation: '/docs',
      status: 'healthy',
    };
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get API health status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns detailed health information about the API',
  })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      memory: {
        heapTotal:
          Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        heapUsed:
          Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
      },
      mongodb: {
        uri: this.configService.mongodbUri.replace(
          /\/\/[^:]+:[^@]+@/,
          '//***:***@',
        ),
        status: 'connected',
      },
    };
  }
}
