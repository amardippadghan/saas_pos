import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Categories')
@ApiBearerAuth()
@ApiHeader({ name: 'x-organization-id', description: 'Organization ID', required: true })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @RequirePermissions('manage_products')
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.categoriesService.create(createCategoryDto, orgId);
  }

  @Get()
  @RequirePermissions('view_products')
  findAll(@Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.categoriesService.findAll(orgId);
  }

  @Get(':id')
  @RequirePermissions('view_products')
  findOne(@Param('id') id: string, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.categoriesService.findOne(id, orgId);
  }

  @Patch(':id')
  @RequirePermissions('manage_products')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.categoriesService.update(id, updateCategoryDto, orgId);
  }

  @Delete(':id')
  @RequirePermissions('manage_products')
  remove(@Param('id') id: string, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.categoriesService.remove(id, orgId);
  }
}
