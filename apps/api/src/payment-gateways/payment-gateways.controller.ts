import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Headers } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PaymentGatewaysService } from './payment-gateways.service';
import { UpsertPaymentGatewayDto, PaymentIntentDto } from './dto/payment-gateway.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Payment Gateways')
@Controller('api/v1')
export class PaymentGatewaysController {
  constructor(private readonly paymentGatewaysService: PaymentGatewaysService) {}

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

  @Post('payments/intent')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-organization-id', required: true })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('create_sale')
  createIntent(@Request() req: any, @Body() dto: PaymentIntentDto) {
    const orgId = req.headers['x-organization-id'];
    return this.paymentGatewaysService.createIntent(orgId, dto);
  }

  @Post('payments/webhook/:provider')
  // Webhooks are usually unauthenticated by JWT, but verified by a signature header
  handleWebhook(
    @Param('provider') provider: string, 
    @Body() payload: any,
    @Headers() headers: any
  ) {
    // We would pass headers to verify the signature (e.g., x-razorpay-signature)
    return this.paymentGatewaysService.handleWebhook(provider.toUpperCase(), payload);
  }
}
