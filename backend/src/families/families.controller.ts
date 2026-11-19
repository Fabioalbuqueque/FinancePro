import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FamiliesService } from './families.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UsersService } from '../users/users.service';
import { FirebaseAuthGuard, AuthenticatedUser } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('families')
@ApiBearerAuth('firebase-auth')
@UseGuards(FirebaseAuthGuard)
@Controller('families')
export class FamiliesController {
  constructor(
    private readonly familiesService: FamiliesService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo grupo familiar' })
  async createFamily(
    @CurrentUser() authUser: AuthenticatedUser,
    @Body() dto: CreateFamilyDto,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.familiesService.createFamily(user._id, dto);
  }

  @Get('current')
  @ApiOperation({ summary: 'Consultar grupo familiar ativo do usuário autenticado' })
  async getCurrentFamily(@CurrentUser() authUser: AuthenticatedUser) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.familiesService.getCurrentFamily(user._id);
  }

  @Get('members')
  @ApiOperation({ summary: 'Listar participantes da família ativa' })
  async getMembers(@CurrentUser() authUser: AuthenticatedUser) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.familiesService.getFamilyMembers(user._id);
  }

  @Post('invitations')
  @ApiOperation({ summary: 'Convidar participante para a família' })
  async inviteMember(
    @CurrentUser() authUser: AuthenticatedUser,
    @Body() dto: InviteMemberDto,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.familiesService.inviteMember(user._id, dto);
  }

  @Delete('members/:memberId')
  @ApiOperation({ summary: 'Remover participante da família (Apenas Admin)' })
  async removeMember(
    @CurrentUser() authUser: AuthenticatedUser,
    @Param('memberId') memberId: string,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.familiesService.removeMember(user._id, memberId);
  }
}
