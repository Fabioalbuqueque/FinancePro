import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ description: 'Nome da conta', example: 'Nubank Corrente' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: ['cash', 'checking', 'savings', 'digital'],
    description: 'Tipo de conta',
    example: 'checking',
  })
  @IsEnum(['cash', 'checking', 'savings', 'digital'])
  type: string;

  @ApiProperty({
    description: 'Saldo inicial em centavos inteiros (Ex: 10000 para R$ 100,00)',
    example: 0,
  })
  @IsNumber()
  initialBalanceCents: number;

  @ApiPropertyOptional({
    enum: ['user', 'family'],
    description: 'Proprietário da conta (pessoal ou familiar)',
    default: 'user',
  })
  @IsOptional()
  @IsEnum(['user', 'family'])
  ownerType?: 'user' | 'family';

  @ApiPropertyOptional({
    description: 'ID da família (obrigatório se ownerType for family)',
  })
  @IsOptional()
  @IsString()
  familyId?: string;
}
