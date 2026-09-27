import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum, IsArray, ValidateNested, IsInt, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentProvider {
  RAZORPAY = 'RAZORPAY',
  MANUAL_UPI = 'MANUAL_UPI',
  // PHONEPE = 'PHONEPE' // Coming soon
}

export class UpsertPaymentGatewayDto {
  @ApiProperty({ enum: PaymentProvider })
  @IsEnum(PaymentProvider)
  provider!: PaymentProvider;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  apiKey?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  apiSecret?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  merchantId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  accessToken?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  refreshToken?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  tokenExpiresAt?: string;

  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;

  @ApiProperty()
  @IsBoolean()
  isTestMode!: boolean;
}

class RazorpayCheckoutItemDto {
  @ApiProperty()
  @IsString()
  productVariantId!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateRazorpayOrderDto {
  @ApiProperty()
  @IsString()
  branchId!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ type: [RazorpayCheckoutItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RazorpayCheckoutItemDto)
  items!: RazorpayCheckoutItemDto[];

  @ApiProperty({ required: false, default: 0 })
  @IsNumber()
  @IsOptional()
  discountAmount?: number;
}

export class VerifyRazorpayPaymentDto {
  @ApiProperty()
  @IsString()
  razorpay_order_id!: string;

  @ApiProperty()
  @IsString()
  razorpay_payment_id!: string;

  @ApiProperty()
  @IsString()
  razorpay_signature!: string;

  @ApiProperty()
  @IsString()
  branchId!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ type: [RazorpayCheckoutItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RazorpayCheckoutItemDto)
  items!: RazorpayCheckoutItemDto[];

  @ApiProperty({ required: false, default: 0 })
  @IsNumber()
  @IsOptional()
  discountAmount?: number;
}
