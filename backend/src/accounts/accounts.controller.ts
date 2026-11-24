import { Controller, Post, Get, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UsersService } from '../users/users.service';
import { FirebaseAuthGuard, AuthenticatedUser } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('accounts')
@ApiBearerAuth('firebase-auth')
@UseGuards(FirebaseAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma conta financeira (individual ou familiar)' })
  async createAccount(
    @CurrentUser() authUser: AuthenticatedUser,
    @Body() dto: CreateAccountDto,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.accountsService.createAccount(user._id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar contas do usuário e familiares' })
  async listAccounts(@CurrentUser() authUser: AuthenticatedUser) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.accountsService.listUserAccounts(user._id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma conta específica' })
  async getAccount(
    @CurrentUser() authUser: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.accountsService.getAccountById(id, user._id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados de uma conta (nome, tipo, saldo)' })
  async updateAccount(
    @CurrentUser() authUser: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.accountsService.updateAccount(id, user._id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma conta (arquiva a conta e mantém lançamentos)' })
  async deleteAccount(
    @CurrentUser() authUser: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.accountsService.deleteAccount(id, user._id);
  }
}
