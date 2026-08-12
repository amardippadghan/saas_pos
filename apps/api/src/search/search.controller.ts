import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@ApiTags('Search')
@ApiBearerAuth()
@ApiHeader({ name: 'x-organization-id', description: 'Organization ID', required: true })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/v1/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiQuery({ name: 'q', required: true, description: 'Search query string' })
  @ApiQuery({ name: 'module', required: false, description: 'Filter by module (products, customers, branches, orders, taxes)' })
  async search(
    @Query('q') query: string,
    @Query('module') module: string,
    @Request() req: any
  ) {
    const orgId = req.headers['x-organization-id'];
    return this.searchService.globalSearch(query, orgId, module);
  }
}
