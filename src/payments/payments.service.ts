import { Injectable } from "@nestjs/common";
import Stripe from "stripe";

import { envs } from "../config";

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);

  async createPaymentSession() {
    const session = await this.stripe.checkout.sessions.create({});

    return session;
  }
}
