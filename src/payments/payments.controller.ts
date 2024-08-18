import { Controller, Get, Post } from "@nestjs/common";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("create-payment-session")
  createPaymentSession() {
    return this.paymentsService.createPaymentSession();
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
  stripeWebook() {
    return `Stripe Webhook`;
  }
}
