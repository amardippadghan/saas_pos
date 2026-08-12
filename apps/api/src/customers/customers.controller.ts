import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Customers')
@ApiBearerAuth()
@ApiHeader({ name: 'x-organization-id', description: 'Organization ID', required: true })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @RequirePermissions('manage_customers')
  create(@Body() createCustomerDto: CreateCustomerDto, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.customersService.create(createCustomerDto, orgId);
  }

  @Get()
  @RequirePermissions('view_customers')
  findAll(@Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.customersService.findAll(orgId);
  }

  @Get(':id')
  @RequirePermissions('view_customers')
  findOne(@Param('id') id: string, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.customersService.findOne(id, orgId);
  }

  @Patch(':id')
  @RequirePermissions('manage_customers')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.customersService.update(id, updateCustomerDto, orgId);
  }

  @Delete(':id')
  @RequirePermissions('manage_customers')
  remove(@Param('id') id: string, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.customersService.remove(id, orgId);
  }
}
