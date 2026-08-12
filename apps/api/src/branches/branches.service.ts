import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDto, organizationId: string) {
    return this.prisma.branch.create({
      data: {
        ...createBranchDto,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.branch.findMany({
      where: { organizationId, deletedAt: null },
    });
  }

  async findOne(id: string, organizationId: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
    
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found in this organization`);
    }
    
    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto, organizationId: string) {
    await this.findOne(id, organizationId); // Ensure it exists and belongs to the org
    return this.prisma.branch.update({
      where: { id },
      data: updateBranchDto,
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
