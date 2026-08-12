import { Controller, Get, UseGuards, Request } from '@nestjs/common';
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
    const orgId = req.headers['x-organization-id'];

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
}
