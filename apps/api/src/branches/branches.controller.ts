import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Branches')
@ApiBearerAuth()
@ApiHeader({ name: 'x-organization-id', description: 'Organization ID', required: true })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @RequirePermissions('manage_branches')
  create(@Body() createBranchDto: CreateBranchDto, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.branchesService.create(createBranchDto, orgId);
  }

  @Get()
  @RequirePermissions('view_branches')
  findAll(@Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.branchesService.findAll(orgId);
  }

  @Get(':id')
  @RequirePermissions('view_branches')
  findOne(@Param('id') id: string, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.branchesService.findOne(id, orgId);
  }

  @Patch(':id')
  @RequirePermissions('manage_branches')
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.branchesService.update(id, updateBranchDto, orgId);
  }

  @Delete(':id')
  @RequirePermissions('manage_branches')
  remove(@Param('id') id: string, @Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.branchesService.remove(id, orgId);
  }
}
