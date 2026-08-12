import { ApiProperty } from '@nestjs/swagger';

export class CreateTaxRuleDto {
  @ApiProperty({ example: 'CGST' })
  name!: string;

  @ApiProperty({ example: 'PERCENTAGE', description: 'PERCENTAGE or FIXED' })
  type!: string;

  @ApiProperty({ example: 2.5 })
  value!: number;

  @ApiProperty({ example: true, required: false })
  isActive?: boolean;
}

export class UpdateTaxRuleDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty({ required: false })
  value?: number;

  @ApiProperty({ required: false })
  isActive?: boolean;
}
