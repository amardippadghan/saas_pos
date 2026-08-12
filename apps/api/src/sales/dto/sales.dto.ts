import { ApiProperty } from '@nestjs/swagger';

export class CheckoutItemDto {
  @ApiProperty({ example: 'variant-uuid' })
  productVariantId!: string;

  @ApiProperty({ example: 2 })
  quantity!: number;
}

export class CheckoutDto {
  @ApiProperty({ example: 'branch-uuid' })
  branchId!: string;

  @ApiProperty({ example: 'customer-uuid', required: false })
  customerId?: string;

  @ApiProperty({ type: [CheckoutItemDto] })
  items!: CheckoutItemDto[];

  @ApiProperty({ example: 'CASH', description: 'CASH, CARD, or UPI' })
  paymentMethod!: string;

  @ApiProperty({ example: 0, required: false })
  discountAmount?: number;
}
