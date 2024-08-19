import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { Request, Response } from "express";

import { PaymentsService } from "./payments.service";

import { PaymentSessionDto } from "./dto";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern("create.payment.session")
  createPaymentSession(@Payload() paymentSessionDto: PaymentSessionDto) {
    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get("success")
  success() {
    return `This action returns a successful payment response`;
  }

  @Get("cancel")
  cancel() {
    return `This action returns a canceled payment response`;
  }

  @Post("webhook")
  stripeWebook(@Req() req: Request, @Res() res: Response) {
    return this.paymentsService.stripeWebhook(req, res);
  }
}
