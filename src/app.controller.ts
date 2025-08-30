import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Application is running successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Shokworks Technical Assessment API is running!',
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        status: { type: 'string', example: 'ok' },
      },
    },
  })
  getHello(): { message: string; timestamp: string; status: string } {
    return {
      message: this.appService.getHello(),
      timestamp: new Date().toISOString(),
      status: 'ok',
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Detailed health check' })
  @ApiResponse({
    status: 200,
    description: 'Detailed health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        uptime: { type: 'number', example: 123.456 },
        environment: { type: 'string', example: 'development' },
      },
    },
  })
  getHealth(): {
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
  } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
