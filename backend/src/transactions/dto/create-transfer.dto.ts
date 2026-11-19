import { IsString, IsNotEmpty, IsNumber, IsDateString, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransferDto {
  @ApiProperty({ description: 'Conta de origem' })
  @IsString()
  @IsNotEmpty()
  fromAccountId: string;

  @ApiProperty({ description: 'Conta de destino' })
  @IsString()
  @IsNotEmpty()
  toAccountId: string;

  @ApiProperty({ description: 'Valor em centavos inteiros', example: 20000 })
  @IsNumber()
  @Min(1)
  amountCents: number;

  @ApiPropertyOptional({ description: 'Descrição da transferência', default: 'Transferência entre contas' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Data da transferência', example: '2026-11-13' })
  @IsDateString()
  date: string;
}
