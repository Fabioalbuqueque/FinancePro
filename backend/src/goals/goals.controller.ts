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
import { GoalsService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';
import { UsersService } from '../users/users.service';
import { FirebaseAuthGuard, AuthenticatedUser } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('goals')
@ApiBearerAuth('firebase-auth')
@UseGuards(FirebaseAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(
    private readonly goalsService: GoalsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar meta financeira' })
  async createGoal(
    @CurrentUser() authUser: AuthenticatedUser,
    @Body() dto: CreateGoalDto,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.goalsService.createGoal(user._id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar metas ativas' })
  async listGoals(@CurrentUser() authUser: AuthenticatedUser) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.goalsService.listGoals(user._id);
  }

  @Post(':id/contribute')
  @ApiOperation({ summary: 'Adicionar contribuição à meta' })
  async addContribution(
    @CurrentUser() authUser: AuthenticatedUser,
    @Param('id') id: string,
    @Body('amountCents') amountCents: number,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.goalsService.addContribution(user._id, id, amountCents);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes da meta' })
  async getGoal(
    @CurrentUser() authUser: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.goalsService.getGoalById(user._id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar meta' })
  async updateGoal(
    @CurrentUser() authUser: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.goalsService.updateGoal(user._id, id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Excluir meta' })
  async deleteGoal(
    @CurrentUser() authUser: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.goalsService.deleteGoal(user._id, id);
  }
}
