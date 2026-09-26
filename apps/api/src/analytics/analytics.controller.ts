import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@ApiHeader({ name: 'x-organization-id', description: 'Organization ID', required: true })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('dashboard')
  @RequirePermissions('view_reports')
  async getDashboardMetrics(@Request() req: any) {
    const organizationId = req.headers['x-organization-id'];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalSales, todaySalesResult, totalCustomers, activeProducts] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { organizationId, status: 'COMPLETED' },
        _sum: { grandTotal: true },
        _count: { id: true }
      }),
      this.prisma.sale.aggregate({
        where: { organizationId, status: 'COMPLETED', createdAt: { gte: today } },
        _sum: { grandTotal: true },
        _count: { id: true }
      }),
      this.prisma.customer.count({
        where: { organizationId, deletedAt: null }
      }),
      this.prisma.product.count({
        where: { organizationId, deletedAt: null, active: true }
      })
    ]);

    return {
      revenue: {
        total: totalSales._sum.grandTotal || 0,
        today: todaySalesResult._sum.grandTotal || 0,
      },
      orders: {
        total: totalSales._count.id || 0,
        today: todaySalesResult._count.id || 0,
      },
      customers: totalCustomers,
      products: activeProducts
    };
  }

  @Get('sales-chart')
  @RequirePermissions('view_reports')
  async getSalesChart(
    @Request() req: any,
    @Query('timeRange') timeRange?: string,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
    @Query('categoryId') categoryId?: string,
    @Query('productId') productId?: string,
  ) {
    const organizationId = req.headers['x-organization-id'];

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (timeRange === 'custom' && startDateStr && endDateStr) {
      startDate = new Date(startDateStr);
      startDate.setHours(0, 0, 0, 0);
      const end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999);
      today.setTime(end.getTime());
    } else if (timeRange === 'all') {
      startDate = new Date('2000-01-01');
    } else if (timeRange === '90d') {
      startDate.setDate(today.getDate() - 90);
    } else if (timeRange === '30d') {
      startDate.setDate(today.getDate() - 30);
    } else { // default to 7d
      startDate.setDate(today.getDate() - 7);
    }

    const whereClause: any = {
      sale: {
        organizationId,
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: today }
      }
    };

    if (categoryId || productId) {
      whereClause.productVariant = { product: {} };
      if (categoryId) {
        whereClause.productVariant.product.categoryId = categoryId;
      }
      if (productId) {
        whereClause.productVariant.product.id = productId;
      }
    }

    const saleItems = await this.prisma.saleItem.findMany({
      where: whereClause,
      select: {
        subtotal: true,
        sale: {
          select: { createdAt: true }
        }
      },
      orderBy: {
        sale: { createdAt: 'asc' }
      }
    });

    const grouped = saleItems.reduce((acc, item) => {
      const dateStr = item.sale.createdAt.toISOString().split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = 0;
      acc[dateStr] += Number(item.subtotal) || 0;
      return acc;
    }, {} as Record<string, number>);

    // Ensure empty dates in range are represented (optional but good for charts)
    // For simplicity, we just return the days that have sales, Recharts connects the dots.
    const chartData = Object.keys(grouped).map(date => ({
      date,
      sales: Number(grouped[date].toFixed(2))
    }));

    // Sort by date just in case
    chartData.sort((a, b) => a.date.localeCompare(b.date));

    return chartData;
  }
}
