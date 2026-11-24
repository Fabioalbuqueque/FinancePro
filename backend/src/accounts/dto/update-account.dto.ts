import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiPropertyOptional({ description: 'Novo nome da conta', example: 'Nubank' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    enum: ['cash', 'checking', 'savings', 'digital'],
    description: 'Novo tipo de conta',
    example: 'savings',
  })
  @IsOptional()
  @IsEnum(['cash', 'checking', 'savings', 'digital'])
  type?: string;

  @ApiPropertyOptional({
    description: 'Novo saldo inicial em centavos inteiros (Ex: 10000 para R$ 100,00)',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  initialBalanceCents?: number;
}
