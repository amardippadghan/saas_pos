import { Test, TestingModule } from '@nestjs/testing';
import { PaymentGatewaysController } from './payment-gateways.controller';

describe('PaymentGatewaysController', () => {
  let controller: PaymentGatewaysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentGatewaysController],
    }).compile();

    controller = module.get<PaymentGatewaysController>(PaymentGatewaysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
