import { ApiProperty } from '@nestjs/swagger';

export enum TransactionType {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  TRANSFER = 'TRANSFER',
  OPENING_STOCK = 'OPENING_STOCK'
}

export class AdjustStockDto {
  @ApiProperty({ example: 'branch-uuid' })
  branchId!: string;

  @ApiProperty({ example: 'variant-uuid' })
  productVariantId!: string;

  @ApiProperty({ example: 10, description: 'Positive to add, negative to remove' })
  quantityChange!: number;

  @ApiProperty({ enum: TransactionType })
  type!: TransactionType;

  @ApiProperty({ required: false })
  reason?: string;

  @ApiProperty({ required: false })
  referenceType?: string;

  @ApiProperty({ required: false })
  referenceId?: string;
}
