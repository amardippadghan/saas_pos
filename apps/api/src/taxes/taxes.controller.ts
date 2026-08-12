import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { TaxesService } from './taxes.service';
import { CreateTaxRuleDto, UpdateTaxRuleDto } from './dto/taxes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Taxes')
@ApiBearerAuth()
@ApiHeader({ name: 'x-organization-id', description: 'Organization ID', required: true })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/taxes')
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Post()
  @RequirePermissions('manage_taxes')
  create(@Body() createDto: CreateTaxRuleDto, @Request() req: any) {
    return this.taxesService.create(createDto, req.headers['x-organization-id']);
  }

  @Get()
  @RequirePermissions('view_taxes')
  findAll(@Request() req: any) {
    return this.taxesService.findAll(req.headers['x-organization-id']);
  }

  @Get(':id')
  @RequirePermissions('view_taxes')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.taxesService.findOne(id, req.headers['x-organization-id']);
  }

  @Patch(':id')
  @RequirePermissions('manage_taxes')
  update(@Param('id') id: string, @Body() updateDto: UpdateTaxRuleDto, @Request() req: any) {
    return this.taxesService.update(id, updateDto, req.headers['x-organization-id']);
  }

  @Delete(':id')
  @RequirePermissions('manage_taxes')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.taxesService.remove(id, req.headers['x-organization-id']);
  }
}
