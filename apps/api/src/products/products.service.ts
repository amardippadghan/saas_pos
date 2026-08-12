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
      where: { organizationId, deletedAt: null },
      include: {
        variants: {
          where: { deletedAt: null }
        },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        variants: {
          where: { deletedAt: null },
          include: {
            inventories: {
              include: {
                branch: true
              }
            }
          }
        },
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
    
    const { variants, ...productData } = updateProductDto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Update the base product
      const updatedProduct = await tx.product.update({
        where: { id },
        data: productData,
      });

      // 2. Handle variants if provided
      if (variants) {
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: id, deletedAt: null }
        });
        
        const existingIds = existingVariants.map(v => v.id);
        const incomingIds = variants.map(v => v.id).filter(id => id !== undefined) as string[];

        // Soft delete variants that are not in the incoming list
        const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));
        if (idsToDelete.length > 0) {
          await tx.productVariant.updateMany({
            where: { id: { in: idsToDelete } },
            data: { deletedAt: new Date() }
          });
        }

        // Upsert incoming variants
        for (const variant of variants) {
          if (variant.id && existingIds.includes(variant.id)) {
            // Update existing
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                name: variant.name || 'Default',
                sku: variant.sku,
                sellingPrice: variant.price,
                costPrice: variant.costPrice || 0,
              }
            });
          } else {
            // Create new
            await tx.productVariant.create({
              data: {
                productId: id,
                name: variant.name || 'Default',
                sku: variant.sku,
                sellingPrice: variant.price,
                costPrice: variant.costPrice || 0,
              }
            });
          }
        }
      }

      // Return fully updated product
      return tx.product.findUnique({
        where: { id },
        include: {
          variants: { where: { deletedAt: null } },
          category: true
        }
      });
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    
    // We should also soft delete the variants
    await this.prisma.productVariant.updateMany({
      where: { productId: id },
      data: { deletedAt: new Date() }
    });

    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
