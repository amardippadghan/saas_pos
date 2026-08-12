import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, organizationId: string) {
    const { variants, categoryId, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        organizationId,
        categoryId,
        variants: {
          create: variants.map(variant => ({
            name: variant.name || 'Default',
            sku: variant.sku,
            sellingPrice: variant.price,
            costPrice: variant.costPrice || 0,
          })),
        },
      },
      include: {
        variants: true,
        category: true,
      }
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.product.findMany({
      where: { organizationId },
      include: {
        variants: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, organizationId },
      include: {
        variants: true,
        category: true,
      },
    });
    
    if (!product) {
      throw new NotFoundException(`Product not found`);
    }
    
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        variants: true,
        category: true,
      }
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
