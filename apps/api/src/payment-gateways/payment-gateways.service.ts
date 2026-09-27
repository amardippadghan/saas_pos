import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertPaymentGatewayDto, CreateRazorpayOrderDto, VerifyRazorpayPaymentDto } from './dto/payment-gateway.dto';
import * as crypto from 'crypto';

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

  /**
   * Get the active Razorpay config (public key only) for the frontend
   */
  async getActiveRazorpayConfig(organizationId: string) {
    const setting = await this.prisma.paymentGatewaySetting.findFirst({
      where: { organizationId, provider: 'RAZORPAY', isActive: true },
    });

    if (!setting) {
      return { enabled: false };
    }

    return {
      enabled: true,
      keyId: setting.apiKey,
    };
  }

  /**
   * Create a Razorpay order using the Razorpay Orders API.
   * We calculate the amount server-side to prevent tampering.
   */
  async createRazorpayOrder(organizationId: string, dto: CreateRazorpayOrderDto) {
    // 1. Fetch the active Razorpay gateway setting
    const gateway = await this.prisma.paymentGatewaySetting.findFirst({
      where: { organizationId, provider: 'RAZORPAY', isActive: true },
    });

    if (!gateway || !gateway.apiKey || !gateway.apiSecret) {
      throw new BadRequestException('Razorpay is not configured or not active for this organization');
    }

    // 2. Verify branch belongs to org
    const branch = await this.prisma.branch.findFirst({
      where: { id: dto.branchId, organizationId },
    });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // 3. Calculate the total server-side (same logic as processCheckout)
    let subtotal = 0;
    for (const item of dto.items) {
      const variant = await this.prisma.productVariant.findFirst({
        where: { id: item.productVariantId, product: { organizationId } },
      });
      if (!variant) {
        throw new BadRequestException(`Product variant ${item.productVariantId} not found`);
      }
      subtotal += Number(variant.sellingPrice) * item.quantity;
    }

    // Calculate taxes
    const taxRules = await this.prisma.taxRule.findMany({
      where: { organizationId, isActive: true },
    });

    let taxAmount = 0;
    for (const tax of taxRules) {
      if (tax.type === 'PERCENTAGE') {
        taxAmount += (subtotal * Number(tax.value)) / 100;
      } else {
        taxAmount += Number(tax.value);
      }
    }

    const discountAmount = dto.discountAmount || 0;
    const grandTotal = subtotal + taxAmount - discountAmount;

    if (grandTotal <= 0) {
      throw new BadRequestException('Order total must be greater than zero');
    }

    // 4. Create order via Razorpay API
    // Razorpay expects amount in paise (smallest currency unit)
    const amountInPaise = Math.round(grandTotal * 100);

    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: gateway.apiKey,
      key_secret: gateway.apiSecret,
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `pos_${Date.now()}`,
      notes: {
        organizationId,
        branchId: dto.branchId,
      },
    });

    return {
      orderId: order.id,
      amount: grandTotal,
      amountInPaise,
      currency: 'INR',
      keyId: gateway.apiKey,
    };
  }

  /**
   * Verify the Razorpay payment signature and place the order.
   * This is the critical step: we only create the sale AFTER payment is verified.
   */
  async verifyAndPlaceOrder(organizationId: string, userId: string, dto: VerifyRazorpayPaymentDto) {
    // 1. Fetch the Razorpay gateway secret for signature verification
    const gateway = await this.prisma.paymentGatewaySetting.findFirst({
      where: { organizationId, provider: 'RAZORPAY', isActive: true },
    });

    if (!gateway || !gateway.apiSecret) {
      throw new BadRequestException('Razorpay is not configured');
    }

    // 2. Verify the payment signature using HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', gateway.apiSecret)
      .update(`${dto.razorpay_order_id}|${dto.razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== dto.razorpay_signature) {
      throw new BadRequestException('Payment verification failed: Invalid signature');
    }

    // 3. Fetch full payment details from Razorpay API
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: gateway.apiKey,
      key_secret: gateway.apiSecret,
    });

    const paymentDetails = await razorpay.payments.fetch(dto.razorpay_payment_id);

    // Extract the rich payment metadata
    const paymentMetadata: Record<string, any> = {
      // Core Razorpay IDs
      razorpay_order_id: dto.razorpay_order_id,
      razorpay_payment_id: dto.razorpay_payment_id,

      // Payment method: card, upi, netbanking, wallet, emi, etc.
      method: paymentDetails.method,
      status: paymentDetails.status,

      // Amount & currency
      amount_paid: paymentDetails.amount / 100, // Convert from paise
      currency: paymentDetails.currency,

      // Razorpay fees & tax (what Razorpay charged you)
      razorpay_fee: paymentDetails.fee ? paymentDetails.fee / 100 : null,
      razorpay_tax: paymentDetails.tax ? paymentDetails.tax / 100 : null,

      // Customer info captured by Razorpay
      email: paymentDetails.email || null,
      contact: paymentDetails.contact || null,

      // Acquirer data (bank transaction ID, RRN, auth code)
      acquirer_data: paymentDetails.acquirer_data || null,

      // Error info (if any partial failure)
      error_code: paymentDetails.error_code || null,
      error_description: paymentDetails.error_description || null,
    };

    // Card-specific details
    if (paymentDetails.method === 'card' && paymentDetails.card) {
      paymentMetadata.card = {
        last4: paymentDetails.card.last4,
        network: paymentDetails.card.network,       // Visa, Mastercard, RuPay, etc.
        type: paymentDetails.card.type,             // credit, debit, prepaid
        issuer: paymentDetails.card.issuer,         // Issuing bank
        international: paymentDetails.card.international,
        emi: paymentDetails.card.emi || false,
        sub_type: paymentDetails.card.sub_type,     // consumer, business, etc.
      };
    }

    // UPI-specific details
    if (paymentDetails.method === 'upi') {
      paymentMetadata.upi = {
        vpa: paymentDetails.vpa,                    // e.g. user@paytm
        payer_account_type: paymentDetails.upi?.payer_account_type || null,
      };
    }

    // Netbanking-specific details
    if (paymentDetails.method === 'netbanking') {
      paymentMetadata.bank = paymentDetails.bank;    // Bank code like HDFC, ICIC, SBIN
    }

    // Wallet-specific details
    if (paymentDetails.method === 'wallet') {
      paymentMetadata.wallet = paymentDetails.wallet; // e.g. paytm, phonepe, freecharge
    }

    // Determine a human-readable payment method string for the Payment.method column
    let methodLabel = 'RAZORPAY';
    if (paymentDetails.method === 'card') {
      const cardType = paymentDetails.card?.type || 'card';
      methodLabel = `CARD (${cardType.toUpperCase()} - ${paymentDetails.card?.network || ''} ****${paymentDetails.card?.last4 || ''})`;
    } else if (paymentDetails.method === 'upi') {
      methodLabel = `UPI (${paymentDetails.vpa || ''})`;
    } else if (paymentDetails.method === 'netbanking') {
      methodLabel = `NETBANKING (${paymentDetails.bank || ''})`;
    } else if (paymentDetails.method === 'wallet') {
      methodLabel = `WALLET (${paymentDetails.wallet || ''})`;
    }

    // 4. Signature & payment verified — now process the checkout
    return this.prisma.$transaction(async (tx: any) => {
      // Verify branch
      const branch = await tx.branch.findFirst({
        where: { id: dto.branchId, organizationId },
      });
      if (!branch) {
        throw new NotFoundException('Branch not found');
      }

      let subtotal = 0;
      const saleItemsData = [];

      for (const item of dto.items) {
        const variant = await tx.productVariant.findFirst({
          where: { id: item.productVariantId, product: { organizationId } },
        });

        if (!variant) {
          throw new BadRequestException(`Product variant ${item.productVariantId} not found`);
        }

        const unitPrice = variant.sellingPrice;
        const lineTotal = Number(unitPrice) * item.quantity;
        subtotal += lineTotal;

        saleItemsData.push({
          productVariantId: variant.id,
          quantity: item.quantity,
          unitPrice,
          subtotal: lineTotal,
        });

        // Update Inventory
        let inventory = await tx.inventory.findUnique({
          where: { branchId_productVariantId: { branchId: dto.branchId, productVariantId: variant.id } },
        });

        if (!inventory) {
          inventory = await tx.inventory.create({
            data: { branchId: dto.branchId, productVariantId: variant.id, quantity: 0 },
          });
        }

        const quantityBefore = inventory.quantity;
        const quantityAfter = quantityBefore - item.quantity;

        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantity: quantityAfter },
        });

        await tx.inventoryTransaction.create({
          data: {
            inventoryId: inventory.id,
            type: 'SALE',
            quantityBefore,
            quantityChange: -item.quantity,
            quantityAfter,
            reason: 'POS Sale (Razorpay)',
            createdByUserId: userId,
          },
        });
      }

      // Calculate taxes
      const taxRules = await tx.taxRule.findMany({
        where: { organizationId, isActive: true },
      });

      let calculatedTaxAmount = 0;
      const taxBreakdown = [];

      for (const tax of taxRules) {
        let amount = 0;
        if (tax.type === 'PERCENTAGE') {
          amount = (subtotal * Number(tax.value)) / 100;
        } else {
          amount = Number(tax.value);
        }
        calculatedTaxAmount += amount;
        taxBreakdown.push({
          id: tax.id,
          name: tax.name,
          type: tax.type,
          value: Number(tax.value),
          amountCalculated: amount,
        });
      }

      const discountAmount = dto.discountAmount || 0;
      const grandTotal = subtotal + calculatedTaxAmount - discountAmount;

      // Create Sale
      const sale = await tx.sale.create({
        data: {
          organizationId,
          branchId: dto.branchId,
          customerId: dto.customerId,
          subtotal,
          taxAmount: calculatedTaxAmount,
          taxBreakdown,
          discountAmount,
          grandTotal,
          status: 'COMPLETED',
          createdByUserId: userId,
          items: {
            create: saleItemsData,
          },
          payments: {
            create: [{
              amount: grandTotal,
              method: methodLabel,
              status: 'COMPLETED',
              transactionId: dto.razorpay_payment_id,
              provider: 'RAZORPAY',
              metadata: paymentMetadata,
            }],
          },
        },
      });

      // Generate Receipt
      const receiptNumber = `RCPT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${sale.id.slice(0, 6).toUpperCase()}`;

      const receipt = await tx.receipt.create({
        data: {
          saleId: sale.id,
          receiptNumber,
        },
      });

      return { sale, receipt };
    }, { maxWait: 10000, timeout: 30000 });
  }
}
