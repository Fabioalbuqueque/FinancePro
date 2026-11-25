import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFamilyDto {
  @ApiPropertyOptional({ description: 'Novo nome do grupo familiar', example: 'Família Almeida' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
