import { Module } from '@nestjs/common';
import { PaymentGatewaysController } from './payment-gateways.controller';
import { PaymentGatewaysService } from './payment-gateways.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentGatewaysController],
  providers: [PaymentGatewaysService]
})
export class PaymentGatewaysModule {}
