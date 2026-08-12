import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Beverages' })
  name!: string;

  @ApiProperty({ example: 'All kinds of drinks', required: false })
  description?: string;
}

export class UpdateCategoryDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  description?: string;
}
