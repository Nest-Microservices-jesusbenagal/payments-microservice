import { Injectable } from "@nestjs/common";
import Stripe from "stripe";

import { envs } from "../config";

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);

  async createPaymentSession() {
    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {},
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "T-shirt",
            },
            unit_amount: 2000, // price multiplied by 100
          },
          quantity: 2,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3003/payments/success",
      cancel_url: "http://localhost:3003/payments/cancel",
    });

    return session;
  }
}
