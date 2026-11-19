import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Descrição da transação', example: 'Compras do mês' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Valor em centavos inteiros (Ex: 15000 para R$ 150,00)',
    example: 15000,
  })
  @IsNumber()
  @Min(1)
  amountCents: number;

  @ApiProperty({ enum: ['income', 'expense'], example: 'expense' })
  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';

  @ApiProperty({ description: 'ID da conta financeira' })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiPropertyOptional({ description: 'ID da categoria' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ['pending', 'paid'], default: 'paid' })
  @IsOptional()
  @IsEnum(['pending', 'paid'])
  status?: 'pending' | 'paid';

  @ApiPropertyOptional({
    enum: ['user', 'family'],
    description: 'Contexto de propriedade da movimentação',
    default: 'user',
  })
  @IsOptional()
  @IsEnum(['user', 'family'])
  ownerType?: 'user' | 'family';

  @ApiProperty({ description: 'Data da movimentação em ISO 8601', example: '2026-11-13' })
  @IsDateString()
  date: string;
}
