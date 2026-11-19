import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
import { UsersService } from '../users/users.service';
import { FirebaseAuthGuard, AuthenticatedUser } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('budgets')
@ApiBearerAuth('firebase-auth')
@UseGuards(FirebaseAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(
    private readonly budgetsService: BudgetsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar orçamento mensal' })
  async createBudget(
    @CurrentUser() authUser: AuthenticatedUser,
    @Body() dto: CreateBudgetDto,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.budgetsService.createBudget(user._id, dto);
  }

  @Get('current')
  @ApiOperation({ summary: 'Obter orçamento do mês atual' })
  async getCurrentBudget(@CurrentUser() authUser: AuthenticatedUser) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.budgetsService.getCurrentBudget(user._id);
  }

  @Get(':month/:year')
  @ApiOperation({ summary: 'Obter orçamento de período específico' })
  async getBudgetForPeriod(
    @CurrentUser() authUser: AuthenticatedUser,
    @Param('month') month: number,
    @Param('year') year: number,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.budgetsService.getBudgetForPeriod(user._id, month, year);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar orçamento' })
  async updateBudget(
    @CurrentUser() authUser: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.budgetsService.updateBudget(user._id, id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Arquivar orçamento' })
  async deleteBudget(
    @CurrentUser() authUser: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.budgetsService.deleteBudget(user._id, id);
  }
}
