import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UsersService } from '../users/users.service';
import { FirebaseAuthGuard, AuthenticatedUser } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('categories')
@ApiBearerAuth('firebase-auth')
@UseGuards(FirebaseAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorias do sistema, do usuário e da família' })
  async getCategories(@CurrentUser() authUser: AuthenticatedUser) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.categoriesService.listCategories(user._id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar categoria personalizada' })
  async createCategory(
    @CurrentUser() authUser: AuthenticatedUser,
    @Body() dto: CreateCategoryDto,
  ) {
    const user = await this.usersService.getOrCreateUser(authUser);
    return this.categoriesService.createCustomCategory(user._id, dto);
  }
}
