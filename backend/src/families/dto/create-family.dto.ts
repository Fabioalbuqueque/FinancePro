import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFamilyDto {
  @ApiProperty({ description: 'Nome do grupo familiar', example: 'Família Silva' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
