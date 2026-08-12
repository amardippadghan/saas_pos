import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { AdjustStockDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Inventory')
@ApiBearerAuth()
@ApiHeader({ name: 'x-organization-id', description: 'Organization ID', required: true })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @RequirePermissions('view_inventory')
  @ApiQuery({ name: 'branchId', required: true })
  getInventory(@Query('branchId') branchId: string, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.inventoryService.getInventoryByBranch(branchId, orgId);
  }

  @Post('adjust')
  @RequirePermissions('manage_inventory')
  adjustStock(@Body() adjustStockDto: AdjustStockDto, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    const userId = req.user.id;
    return this.inventoryService.adjustStock(adjustStockDto, orgId, userId);
  }
}
