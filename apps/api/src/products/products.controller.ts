import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Products')
@ApiBearerAuth()
@ApiHeader({ name: 'x-organization-id', description: 'Organization ID', required: true })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @RequirePermissions('manage_products')
  create(@Body() createProductDto: CreateProductDto, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.productsService.create(createProductDto, orgId);
  }

  @Get()
  @RequirePermissions('view_products')
  findAll(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string
  ) {
    const orgId = req.headers['x-organization-id'];
    return this.productsService.findAll(orgId, {
      search,
      categoryId,
      cursor,
      limit: limit ? parseInt(limit, 10) : 20
    });
  }

  @Get(':id')
  @RequirePermissions('view_products')
  findOne(@Param('id') id: string, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.productsService.findOne(id, orgId);
  }

  @Patch(':id')
  @RequirePermissions('manage_products')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.productsService.update(id, updateProductDto, orgId);
  }

  @Delete(':id')
  @RequirePermissions('manage_products')
  remove(@Param('id') id: string, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.productsService.remove(id, orgId);
  }
}
