import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaxRuleDto, UpdateTaxRuleDto } from './dto/taxes.dto';

@Injectable()
export class TaxesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateTaxRuleDto, organizationId: string) {
    return this.prisma.taxRule.create({
      data: {
        ...createDto,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.taxRule.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const tax = await this.prisma.taxRule.findFirst({
      where: { id, organizationId },
    });
    if (!tax) throw new NotFoundException('Tax rule not found');
    return tax;
  }

  async update(id: string, updateDto: UpdateTaxRuleDto, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.taxRule.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.taxRule.delete({
      where: { id },
    });
  }
}
