import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Sales')
@ApiBearerAuth()
@ApiHeader({ name: 'x-organization-id', description: 'Organization ID', required: true })
@ApiHeader({ name: 'x-branch-id', description: 'Branch ID', required: true })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @RequirePermissions('create_sales')
  create(@Body() createSaleDto: CreateSaleDto, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    const branchId = req.headers['x-branch-id'];
    const userId = req.user.sub;
    return this.salesService.create(createSaleDto, orgId, branchId, userId);
  }

  @Get('stats')
  @RequirePermissions('view_reports')
  getDashboardStats(@Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    const branchId = req.headers['x-branch-id'];
    return this.salesService.getDashboardStats(orgId, branchId);
  }

  @Get()
  @RequirePermissions('view_sales')
  findAll(@Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    const branchId = req.headers['x-branch-id'];
    return this.salesService.findAll(orgId, branchId);
  }

  @Get(':id')
  @RequirePermissions('view_sales')
  findOne(@Param('id') id: string, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.salesService.findOne(id, orgId);
  }
}
