import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto, organizationId: string, branchId: string, userId: string) {
    let subtotal = 0;

    // Validate products and calculate subtotal
    for (const item of createSaleDto.items) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: item.productVariantId },
        include: { product: true }
      });

      if (!variant || variant.product.organizationId !== organizationId) {
        throw new BadRequestException(`Product variant ${item.productVariantId} not found`);
      }

      // In a real app, you might want to check inventory here

      subtotal += Number(variant.sellingPrice) * item.quantity;
      item.unitPrice = Number(variant.sellingPrice);
      item.subtotal = Number(variant.sellingPrice) * item.quantity;
    }

    const taxAmount = createSaleDto.taxAmount || 0;
    const discountAmount = createSaleDto.discountAmount || 0;
    const grandTotal = subtotal + taxAmount - discountAmount;

    // Create the sale
    const sale = await this.prisma.sale.create({
      data: {
        organizationId,
        branchId,
        customerId: createSaleDto.customerId,
        subtotal,
        taxAmount,
        discountAmount,
        grandTotal,
        createdByUserId: userId,
        status: 'COMPLETED',
        items: {
          create: createSaleDto.items.map(item => ({
            quantity: item.quantity,
            unitPrice: item.unitPrice || 0,
            subtotal: item.subtotal || 0,
            productVariant: {
              connect: { id: item.productVariantId }
            }
          }))
        },
        payments: {
          create: {
            amount: grandTotal,
            method: createSaleDto.paymentMethod || 'CASH',
            status: 'COMPLETED'
          }
        }
      },
      include: {
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

    // Optionally update inventory here...

    return sale;
  }

  async getDashboardStats(organizationId: string, branchId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const branchFilter = branchId ? { branchId } : {};

    // 1. Today's Sales (amount and count)
    const todaysSales = await this.prisma.sale.aggregate({
      where: {
        organizationId,
        ...branchFilter,
        createdAt: {
          gte: today
        },
        status: 'COMPLETED'
      },
      _sum: {
        grandTotal: true
      },
      _count: {
        id: true
      }
    });

    // 2. Day-wise sales for the last 7 days
    // In raw SQL this would be a GROUP BY date, but with Prisma we can do this:
    const weeklySalesData = await this.prisma.sale.findMany({
      where: {
        organizationId,
        ...branchFilter,
        createdAt: {
          gte: oneWeekAgo
        },
        status: 'COMPLETED'
      },
      select: {
        grandTotal: true,
        createdAt: true
      }
    });

    // Aggregate by day
    const dayWiseSalesMap = new Map();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dayWiseSalesMap.set(dateStr, 0);
    }

    weeklySalesData.forEach(sale => {
      const dateStr = sale.createdAt.toISOString().split('T')[0];
      if (dayWiseSalesMap.has(dateStr)) {
        dayWiseSalesMap.set(dateStr, dayWiseSalesMap.get(dateStr) + Number(sale.grandTotal));
      }
    });

    const dayWiseSales = Array.from(dayWiseSalesMap.entries()).map(([date, total]) => ({
      date,
      total
    })).sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically

    // 3. Weekly total
    const weeklyTotal = dayWiseSales.reduce((sum, day) => sum + day.total, 0);

    // 4. Total Customers
    const totalCustomers = await this.prisma.customer.count({
      where: {
        organizationId,
        deletedAt: null
      }
    });

    return {
      todayAmount: todaysSales._sum.grandTotal || 0,
      todayTransactions: todaysSales._count.id || 0,
      weeklyAmount: weeklyTotal,
      dayWiseSales,
      totalCustomers
    };
  }

  findAll(organizationId: string, branchId?: string) {
    const branchFilter = branchId ? { branchId } : {};

    return this.prisma.sale.findMany({
      where: {
        organizationId,
        ...branchFilter
      },
      include: {
        customer: true,
        items: true,
        payments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findOne(id: string, organizationId: string) {
    const sale = await this.prisma.sale.findFirst({
      where: {
        id,
        organizationId
      },
      include: {
        customer: true,
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
      throw new NotFoundException(`Sale ${id} not found`);
    }

    return sale;
  }
}