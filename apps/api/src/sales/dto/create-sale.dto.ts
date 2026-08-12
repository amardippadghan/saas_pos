import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SaleItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productVariantId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  unitPrice?: number;
  subtotal?: number;
}

export class CreateSaleDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ type: [SaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  taxAmount?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @ApiProperty({ required: false, default: 'CASH' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;
}