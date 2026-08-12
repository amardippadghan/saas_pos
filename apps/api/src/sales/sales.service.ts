import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/sales.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.sale.findMany({
      where: { organizationId },
      include: {
        customer: true,
        branch: true,
        receipts: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id, organizationId },
      include: {
        customer: true,
        branch: true,
        receipts: true,
        items: {
          include: {
            productVariant: {
              include: {
                product: true
              }
            }
          }
        },
        payments: true
      }
    });

    if (!sale) {
      throw new NotFoundException(`Sale not found`);
    }

    return sale;
  }

  async processCheckout(dto: CheckoutDto, organizationId: string, userId: string) {
    const { branchId, customerId, items, paymentMethod, discountAmount = 0 } = dto;

    if (!items || items.length === 0) {
      throw new BadRequestException('Cannot process an empty cart');
    }

    // Verify branch belongs to org
    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, organizationId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // Process entirely within a transaction
    return this.prisma.$transaction(async (tx : any ) => {
      let subtotal = 0;
      const saleItemsData = [];

      for (const item of items) {
        // Fetch the real variant to get accurate pricing
        const variant = await tx.productVariant.findFirst({
          where: { id: item.productVariantId, product: { organizationId } },
        });

        if (!variant) {
          throw new BadRequestException(`Product variant ${item.productVariantId} not found`);
        }

        const unitPrice = variant.sellingPrice;
        // Decimal calculations in JS can be tricky, but Prisma returns Decimal objects. We'll convert to numbers for simple math here, then pass back.
        const lineTotal = Number(unitPrice) * item.quantity;
        subtotal += lineTotal;

        saleItemsData.push({
          productVariantId: variant.id,
          quantity: item.quantity,
          unitPrice,
          subtotal: lineTotal,
        });

        // Update Inventory & Create Transaction
        let inventory = await tx.inventory.findUnique({
          where: { branchId_productVariantId: { branchId, productVariantId: variant.id } }
        });

        if (!inventory) {
          inventory = await tx.inventory.create({
            data: { branchId, productVariantId: variant.id, quantity: 0 }
          });
        }

        const quantityBefore = inventory.quantity;
        const quantityAfter = quantityBefore - item.quantity;

        // Note: For a POS, we might allow negative stock if physical stock was sold but not recorded yet.
        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantity: quantityAfter }
        });

        await tx.inventoryTransaction.create({
          data: {
            inventoryId: inventory.id,
            type: 'SALE',
            quantityBefore,
            quantityChange: -item.quantity,
            quantityAfter,
            reason: 'POS Sale',
            createdByUserId: userId,
          }
        });
      }

      // Final calculations
      // Fetch and calculate dynamic taxes
      const taxRules = await tx.taxRule.findMany({
        where: { organizationId, isActive: true }
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
          amountCalculated: amount
        });
      }

      const grandTotal = subtotal + calculatedTaxAmount - discountAmount;

      if (grandTotal < 0) {
        throw new BadRequestException('Grand total cannot be negative');
      }

      // Create Sale
      const sale = await tx.sale.create({
        data: {
          organizationId,
          branchId,
          customerId,
          subtotal,
          taxAmount: calculatedTaxAmount,
          taxBreakdown: taxBreakdown,
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
              method: paymentMethod,
              status: 'COMPLETED',
            }]
          }
        },
      });

      // Generate Receipt
      const receiptNumber = `RCPT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${sale.id.slice(0,6).toUpperCase()}`;
      
      const receipt = await tx.receipt.create({
        data: {
          saleId: sale.id,
          receiptNumber,
        }
      });

      return {
        sale,
        receipt,
      };
    });
  }
}
