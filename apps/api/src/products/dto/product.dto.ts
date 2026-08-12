import { ApiProperty } from '@nestjs/swagger';

export class CreateProductVariantDto {
  @ApiProperty({ example: 'Large / Red', required: false })
  name?: string;

  @ApiProperty({ example: 'SKU12345-L-RED' })
  sku!: string;

  @ApiProperty({ example: 10.99 })
  price!: number;
  
  @ApiProperty({ example: 8.50, required: false })
  costPrice?: number;
}

export class CreateProductDto {
  @ApiProperty({ example: 'T-Shirt' })
  name!: string;

  @ApiProperty({ example: 'A cool t-shirt', required: false })
  description?: string;

  @ApiProperty({ example: 'cat-id-123', required: false })
  categoryId?: string;
  
  @ApiProperty({ type: [CreateProductVariantDto], description: 'Product variants' })
  variants!: CreateProductVariantDto[];
}

export class UpdateProductDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  categoryId?: string;
}
