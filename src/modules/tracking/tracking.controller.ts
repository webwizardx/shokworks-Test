import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TrackAccessResponseDto } from './dto/tracking-stats-response.dto';
import { TrackingStatsDto } from './dto/tracking-stats.dto';
import { TrackingService } from './tracking.service';

@ApiTags('Tracking')
@Controller('tracking')
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
  trackAccess(@Request() req): TrackAccessResponseDto {
    const { name: username } = req.user;

    // Record the access
    this.trackingService.recordAccess(username);

    return {
      message: 'Access tracked successfully',
      username,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get tracking statistics' })
  @ApiResponse({
    status: 200,
    description: 'Tracking statistics retrieved successfully',
    type: TrackingStatsDto,
  })
  getStats(): TrackingStatsDto {
    return this.trackingService.getStats();
  }
}
