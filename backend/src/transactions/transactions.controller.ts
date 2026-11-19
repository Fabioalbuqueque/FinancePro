import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { UsersService } from '../users/users.service';
import { FirebaseAuthGuard, AuthenticatedUser } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('transactions')
@ApiBearerAuth('firebase-auth')
@UseGuards(FirebaseAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar nova movimentação (receita ou despesa)' })
  async createTransaction(
    @CurrentUser() authUser: AuthenticatedUser,
    @Body() dto: CreateTransactionDto,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.transactionsService.createTransaction(user._id, dto);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Realizar transferência atômica entre contas' })
  async createTransfer(
    @CurrentUser() authUser: AuthenticatedUser,
    @Body() dto: CreateTransferDto,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.transactionsService.createTransfer(user._id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar movimentações com paginação e filtros' })
  async listTransactions(
    @CurrentUser() authUser: AuthenticatedUser,
    @Query() filter: FilterTransactionDto,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.transactionsService.listTransactions(user._id, filter);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar movimentação financeira' })
  async updateTransaction(
    @CurrentUser() authUser: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.transactionsService.updateTransaction(user._id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir movimentação financeira' })
  async deleteTransaction(
    @CurrentUser() authUser: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.transactionsService.deleteTransaction(user._id, id);
  }
}
