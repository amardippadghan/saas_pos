import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto, organizationId: string) {
    return this.prisma.customer.create({
      data: {
        ...createCustomerDto,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, search?: string) {
    return this.prisma.customer.findMany({
      where: { 
        organizationId, 
        deletedAt: null,
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ]
        } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // limit to 20 for dropdown performance
    });
  }

  async findOne(id: string, organizationId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        sales: {
          include: { receipts: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!customer) {
      throw new NotFoundException(`Customer not found`);
    }
    
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
