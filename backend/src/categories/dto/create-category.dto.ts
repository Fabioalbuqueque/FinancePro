import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Nome da categoria', example: 'Streaming & Jogos' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: ['income', 'expense'], example: 'expense' })
  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';

  @ApiPropertyOptional({ enum: ['user', 'family'], default: 'user' })
  @IsOptional()
  @IsEnum(['user', 'family'])
  scope?: 'user' | 'family';

  @ApiPropertyOptional({ example: 'game-controller' })
  @IsOptional()
  @IsString()
  icon?: string;
}
