import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string, organizationId: string, module?: string) {
    if (!query || query.trim() === '') return [];
    
    const searchStr = query.trim();
    const searchFilter = { contains: searchStr, mode: 'insensitive' as const };
    const results = [];

    // Search Products
    if (!module || module === 'products') {
      const products = await this.prisma.product.findMany({
        where: {
          organizationId,
          deletedAt: null,
          OR: [
            { name: searchFilter },
            { description: searchFilter },
            { category: { name: searchFilter } }
          ]
        },
        take: 10
      });
      results.push(...products.map((p : any) => ({
        id: p.id,
        type: 'Product',
        title: p.name,
        subtitle: p.description || 'Product',
        url: `/dashboard/products/${p.id}`
      })));

      // Search Variants directly and map to their parent product URL
      const variants = await this.prisma.productVariant.findMany({
        where: {
          product: { organizationId, deletedAt: null },
          deletedAt: null,
          OR: [
            { name: searchFilter },
            { sku: searchFilter }
          ]
        },
        include: { product: true },
        take: 10
      });
      results.push(...variants.map((v: any) => ({
        id: v.id, // we might navigate to product page, but keep unique ID for react key
        type: 'Product Variant',
        title: `${v.product.name} - ${v.name}`,
        subtitle: `SKU: ${v.sku} | Price: $${Number(v.sellingPrice)}`,
        url: `/dashboard/products/${v.productId}`
      })));
    }

    // Search Customers
    if (!module || module === 'customers') {
      const customers = await this.prisma.customer.findMany({
        where: {
          organizationId,
          deletedAt: null,
          OR: [
            { name: searchFilter },
            { email: searchFilter },
            { phone: searchFilter }
          ]
        },
        take: 10
      });
      results.push(...customers.map((c : any)  => ({
        id: c.id,
        type: 'Customer',
        title: c.name,
        subtitle: c.email || c.phone || 'Customer',
        url: `/dashboard/customers/${c.id}`
      })));
    }

    // Search Branches
    if (!module || module === 'branches') {
      const branches = await this.prisma.branch.findMany({
        where: {
          organizationId,
          deletedAt: null,
          OR: [
            { name: searchFilter },
            { address: searchFilter }
          ]
        },
        take: 5
      });
      results.push(...branches.map((b: any) => ({
        id: b.id,
        type: 'Branch',
        title: b.name,
        subtitle: b.address || 'Branch',
        url: `/dashboard/branches/${b.id}`
      })));
    }

    // Search Orders (Sales & Receipts)
    if (!module || module === 'orders') {
      const sales = await this.prisma.sale.findMany({
        where: {
          organizationId,
          OR: [
            { receipts: { some: { receiptNumber: searchFilter } } },
            { customer: { name: searchFilter } }
          ]
        },
        include: { receipts: true, customer: true },
        take: 10
      });
      results.push(...sales.map((s: any) => ({
        id: s.id,
        type: 'Order',
        title: `Order ${s.receipts[0]?.receiptNumber || s.id} - ${s.customer?.name || 'Walk-in'}`,
        subtitle: `Total: $${Number(s.grandTotal)} | Status: ${s.status}`,
        url: `/dashboard/orders/${s.id}`
      })));
    }

    // Search Taxes
    if (!module || module === 'taxes') {
      const taxes = await this.prisma.taxRule.findMany({
        where: {
          organizationId,
          name: searchFilter
        },
        take: 5
      });
      results.push(...taxes.map((t: any) => ({
        id: t.id,
        type: 'Tax Rule',
        title: t.name,
        subtitle: `${t.type === 'PERCENTAGE' ? t.value + '%' : '$' + t.value}`,
        url: `/dashboard/settings/taxes`
      })));
    }

    return results;
  }
}
