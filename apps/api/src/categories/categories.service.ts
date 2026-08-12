import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto, organizationId: string) {
    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.category.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
    
    if (!category) {
      throw new NotFoundException(`Category not found`);
    }
    
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
