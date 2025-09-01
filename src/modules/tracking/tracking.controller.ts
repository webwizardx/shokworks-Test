import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TrackAccessResponseDto } from './dto/tracking-stats-response.dto';
import { TrackingStatsDto } from './dto/tracking-stats.dto';
import { TrackingService } from './tracking.service';

@ApiTags('Tracking')
@Controller()
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('track')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Track user access' })
  @ApiResponse({
    status: 201,
    description: 'Access tracked successfully',
    type: TrackAccessResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Invalid or missing token',
  })
  async trackAccess(@Request() req): Promise<TrackAccessResponseDto> {
    const { name: username } = req.user;

    // Record the access
    const accessLog = await this.trackingService.recordAccess(username);

    return {
      message: 'Access tracked successfully',
      username,
      timestamp: accessLog.timestamp.toISOString(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get tracking statistics' })
  @ApiResponse({
    status: 200,
    description: 'Tracking statistics retrieved successfully',
    type: TrackingStatsDto,
  })
  async getStats(): Promise<TrackingStatsDto> {
    return await this.trackingService.getStats();
  }
}
