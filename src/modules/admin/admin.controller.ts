import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  @Get('dashboard')
  @ApiOperation({ summary: 'Protected admin dashboard endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Access granted - Welcome message with user name',
    type: DashboardResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Invalid or missing token',
  })
  getDashboard(@Request() req) {
    const user = req.user;

    return {
      message: `Welcome to the admin dashboard, ${user.name}!`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
