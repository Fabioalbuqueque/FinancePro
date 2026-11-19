import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FirebaseAuthGuard, AuthenticatedUser } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth('firebase-auth')
@UseGuards(FirebaseAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Consultar perfil do usuário autenticado' })
  async getMe(@CurrentUser() authUser: AuthenticatedUser) {
    return this.usersService.getOrCreateUser(authUser);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualizar perfil e preferências' })
  async updateMe(
    @CurrentUser() authUser: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(authUser.uid, dto);
  }
}
