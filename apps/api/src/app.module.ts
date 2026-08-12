import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { BranchesModule } from './branches/branches.module';
import { CustomersModule } from './customers/customers.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { SalesModule } from './sales/sales.module';
import { TaxesModule } from './taxes/taxes.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [PrismaModule,    AuthModule,
    UsersModule,
    OrganizationsModule,
    BranchesModule,
    CustomersModule,
    CategoriesModule,
    ProductsModule,
    InventoryModule,
    SalesModule,
    TaxesModule,
    AnalyticsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
