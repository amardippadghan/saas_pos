import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PaymentGatewaysService } from './payment-gateways.service';
import { UpsertPaymentGatewayDto, CreateRazorpayOrderDto, VerifyRazorpayPaymentDto } from './dto/payment-gateway.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Payment Gateways')
@Controller('api/v1')
export class PaymentGatewaysController {
  constructor(private readonly paymentGatewaysService: PaymentGatewaysService) {}

  // ─── Settings CRUD (Admin only) ───────────────────────────────────────

  @Get('settings/payment-gateways')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-organization-id', required: true })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('manage_settings')
  getSettings(@Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.paymentGatewaysService.getSettings(orgId);
  }

  @Get('settings/payment-gateways/:provider')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-organization-id', required: true })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('manage_settings')
  getSetting(@Request() req: any, @Param('provider') provider: string) {
    const orgId = req.headers['x-organization-id'];
    return this.paymentGatewaysService.getSetting(orgId, provider.toUpperCase());
  }

  @Post('settings/payment-gateways')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-organization-id', required: true })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('manage_settings')
  upsertSetting(@Request() req: any, @Body() dto: UpsertPaymentGatewayDto) {
    const orgId = req.headers['x-organization-id'];
    return this.paymentGatewaysService.upsertSetting(orgId, dto);
  }

  // ─── Razorpay Checkout Flow ───────────────────────────────────────────

  @Get('payments/razorpay/config')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-organization-id', required: true })
  @UseGuards(JwtAuthGuard)
  getRazorpayConfig(@Request() req: any) {
    const orgId = req.headers['x-organization-id'];
    return this.paymentGatewaysService.getActiveRazorpayConfig(orgId);
  }

  @Post('payments/razorpay/create-order')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-organization-id', required: true })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('process_sales')
  createRazorpayOrder(@Request() req: any, @Body() dto: CreateRazorpayOrderDto) {
    const orgId = req.headers['x-organization-id'];
    return this.paymentGatewaysService.createRazorpayOrder(orgId, dto);
  }

  @Post('payments/razorpay/verify')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-organization-id', required: true })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('process_sales')
  verifyRazorpayPayment(@Request() req: any, @Body() dto: VerifyRazorpayPaymentDto) {
    const orgId = req.headers['x-organization-id'];
    const userId = req.user.id;
    return this.paymentGatewaysService.verifyAndPlaceOrder(orgId, userId, dto);
  }
}
