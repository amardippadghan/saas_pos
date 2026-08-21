import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentProvider {
  RAZORPAY = 'RAZORPAY',
  PHONEPE = 'PHONEPE'
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

export class PaymentIntentDto {
  @ApiProperty()
  @IsString()
  saleId!: string;

  @ApiProperty()
  @IsString()
  method!: string; // 'UPI' | 'CARD'
}
