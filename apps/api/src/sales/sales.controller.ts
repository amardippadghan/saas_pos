import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CheckoutDto } from './dto/sales.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Sales & POS')
@ApiBearerAuth()
@ApiHeader({ name: 'x-organization-id', description: 'Organization ID', required: true })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @RequirePermissions('view_sales')
  findAll(@Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.salesService.findAll(orgId);
  }

  @Get(':id')
  @RequirePermissions('view_sales')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.salesService.findOne(id, orgId);
  }

  @Post('checkout')
  @RequirePermissions('process_sales')
  checkout(@Body() checkoutDto: CheckoutDto, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    const userId = req.user.id;
    return this.salesService.processCheckout(checkoutDto, orgId, userId);
  }
}
