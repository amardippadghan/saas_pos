import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustStockDto, TransactionType } from './dto/inventory.dto';


@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getInventoryByBranch(branchId: string, organizationId: string, page = 1, limit = 50) {
    // Verify branch belongs to organization
    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, organizationId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where: { branchId },
        include: {
          productVariant: {
            include: { product: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.inventory.count({ where: { branchId } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async adjustStock(dto: AdjustStockDto, organizationId: string, userId: string) {
    const { branchId, productVariantId, quantityChange, type, reason, referenceType, referenceId } = dto;

    // Verify branch belongs to organization
    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, organizationId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // Use a transaction to guarantee atomicity
    return this.prisma.$transaction(async (tx : any ) => {
      // Find or create the inventory record
      let inventory = await tx.inventory.findUnique({
        where: {
          branchId_productVariantId: {
            branchId,
            productVariantId,
          }
        }
      });

      if (!inventory) {
        inventory = await tx.inventory.create({
          data: {
            branchId,
            productVariantId,
            quantity: 0,
          }
        });
      }

      const quantityBefore = inventory.quantity;
      const quantityAfter = quantityBefore + quantityChange;

      // Ensure we don't drop below 0 if not allowed (optional business rule, here we allow negatives for backorders, or block it)
      // For now, let's allow negative stock as a feature, but normally you'd block if `quantityAfter < 0`

      // 1. Update inventory
      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: { quantity: quantityAfter },
        include: {
          productVariant: {
            include: { product: true }
          }
        }
      });

      // 2. Record transaction
      await tx.inventoryTransaction.create({
        data: {
          inventoryId: inventory.id,
          type: type as TransactionType,
          quantityBefore,
          quantityChange,
          quantityAfter,
          reason,
          referenceType,
          referenceId,
          createdByUserId: userId,
        }
      });

      return updatedInventory;
    });
  }
}
