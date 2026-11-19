import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { UsersService } from '../users/users.service';
import { FirebaseAuthGuard, AuthenticatedUser } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('dashboard')
@ApiBearerAuth('firebase-auth')
@UseGuards(FirebaseAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obter indicadores e resumo do dashboard' })
  @ApiQuery({ name: 'scope', required: false, enum: ['user', 'family', 'all'] })
  async getDashboard(
    @CurrentUser() authUser: AuthenticatedUser,
    @Query('scope') scope?: 'user' | 'family' | 'all',
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.dashboardService.getDashboardSummary(user._id, scope);
  }
}
