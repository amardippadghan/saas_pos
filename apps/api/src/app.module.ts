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

@Module({
  imports: [PrismaModule,    AuthModule,
    UsersModule,
    OrganizationsModule,
    BranchesModule,
    CustomersModule,
    CategoriesModule,
    ProductsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
