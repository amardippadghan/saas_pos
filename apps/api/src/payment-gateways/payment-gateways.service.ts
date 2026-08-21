import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertPaymentGatewayDto, PaymentIntentDto } from './dto/payment-gateway.dto';

@Injectable()
export class PaymentGatewaysService {
  constructor(private prisma: PrismaService) {}

  async getSettings(organizationId: string) {
    return this.prisma.paymentGatewaySetting.findMany({
      where: { organizationId },
    });
  }

  async getSetting(organizationId: string, provider: string) {
    const setting = await this.prisma.paymentGatewaySetting.findUnique({
      where: { organizationId_provider: { organizationId, provider } },
    });
    if (!setting) throw new NotFoundException(`Settings for ${provider} not found`);
    return setting;
  }

  async upsertSetting(organizationId: string, dto: UpsertPaymentGatewayDto) {
    return this.prisma.paymentGatewaySetting.upsert({
      where: {
        organizationId_provider: {
          organizationId,
          provider: dto.provider,
        },
      },
      update: {
        apiKey: dto.apiKey,
        apiSecret: dto.apiSecret,
        merchantId: dto.merchantId,
        accessToken: dto.accessToken,
        refreshToken: dto.refreshToken,
        tokenExpiresAt: dto.tokenExpiresAt ? new Date(dto.tokenExpiresAt) : null,
        isActive: dto.isActive,
        isTestMode: dto.isTestMode,
      },
      create: {
        organizationId,
        provider: dto.provider,
        apiKey: dto.apiKey,
        apiSecret: dto.apiSecret,
        merchantId: dto.merchantId,
        accessToken: dto.accessToken,
        refreshToken: dto.refreshToken,
        tokenExpiresAt: dto.tokenExpiresAt ? new Date(dto.tokenExpiresAt) : null,
        isActive: dto.isActive,
        isTestMode: dto.isTestMode,
      },
    });
  }

  async createIntent(organizationId: string, dto: PaymentIntentDto) {
    const sale = await this.prisma.sale.findUnique({ where: { id: dto.saleId } });
    if (!sale || sale.organizationId !== organizationId) {
      throw new NotFoundException('Sale not found');
    }

    // Find an active payment gateway
    const gateway = await this.prisma.paymentGatewaySetting.findFirst({
      where: { organizationId, isActive: true },
    });

    if (!gateway) {
      throw new BadRequestException('No active payment gateway configured');
    }

    // Mock response for intent creation for MVP
    // In production, this would make an HTTP request to Razorpay/PhonePe API
    const mockOrderId = `${gateway.provider}_ORDER_${Math.random().toString(36).substring(7)}`;

    return {
      provider: gateway.provider,
      orderId: mockOrderId,
      amount: sale.grandTotal,
      currency: 'INR',
      key: gateway.apiKey,
      // For PhonePe, you might return an instrument response or redirect url
    };
  }

  async handleWebhook(provider: string, payload: any) {
    // 1. Verify webhook signature
    // 2. Extract sale ID and status
    // 3. Update Payment and Sale models in DB
    console.log(`Received webhook for ${provider}:`, payload);
    return { received: true };
  }
}
