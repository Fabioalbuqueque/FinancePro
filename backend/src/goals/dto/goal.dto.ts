import { IsNumber, IsOptional, IsString, IsDateString, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGoalDto {
  @ApiProperty({ description: 'Nome da meta', example: 'Viagem para o Japão' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ description: 'Valor alvo em centavos', example: 500000 })
  @IsNumber()
  @Min(1)
  targetAmountCents: number;

  @ApiProperty({ description: 'Valor inicial em centavos', default: 0, example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentAmountCents?: number;

  @ApiProperty({ description: 'Prazo final', example: '2027-06-30' })
  @IsDateString()
  deadline: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Categoria', example: 'Viagem' })
  @IsOptional()
  @IsString()
  category?: string;
}

export class UpdateGoalDto {
  @ApiPropertyOptional({ description: 'Nome da meta' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiPropertyOptional({ description: 'Valor alvo em centavos' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  targetAmountCents?: number;

  @ApiPropertyOptional({ description: 'Valor atual em centavos' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentAmountCents?: number;

  @ApiPropertyOptional({ description: 'Prazo final' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ description: 'Status', example: 'active' })
  @IsOptional()
  @IsString()
  status?: 'active' | 'completed' | 'abandoned';

  @ApiPropertyOptional({ description: 'Descrição detalhada' })
  @IsOptional()
  @IsString()
  description?: string;
}
