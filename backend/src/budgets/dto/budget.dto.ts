import { IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBudgetDto {
  @ApiProperty({ description: 'Mês do orçamento', example: 11 })
  @IsNumber()
  @Min(1)
  month: number;

  @ApiProperty({ description: 'Ano do orçamento', example: 2026 })
  @IsNumber()
  @Min(2020)
  year: number;

  @ApiProperty({ description: 'Orçamento total em centavos', example: 500000 })
  @IsNumber()
  @Min(0)
  totalBudgetCents: number;

  @ApiPropertyOptional({
    description: 'Orçamentos por categoria',
  })
  @IsOptional()
  categoryBudgets?: {
    categoryId: string;
    budgetCents: number;
  }[];
}

export class UpdateBudgetDto {
  @ApiPropertyOptional({ description: 'Orçamento total em centavos' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalBudgetCents?: number;

  @ApiPropertyOptional({ description: 'Orçamentos por categoria' })
  @IsOptional()
  categoryBudgets?: {
    categoryId: string;
    budgetCents: number;
  }[];
}
