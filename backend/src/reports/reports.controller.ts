import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { UsersService } from '../users/users.service';
import { FirebaseAuthGuard, AuthenticatedUser } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('reports')
@ApiBearerAuth('firebase-auth')
@UseGuards(FirebaseAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly usersService: UsersService,
  ) {}

  @Get('monthly')
  @ApiOperation({ summary: 'Consultar relatório mensal com despesas por categoria' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'scope', required: false, enum: ['user', 'family', 'all'] })
  async getMonthlyReport(
    @CurrentUser() authUser: AuthenticatedUser,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('scope') scope?: 'user' | 'family' | 'all',
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    const now = new Date();
    const targetMonth = month ? parseInt(month, 10) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();

    return this.reportsService.getMonthlyReport(user._id, targetMonth, targetYear, scope);
  }
}
