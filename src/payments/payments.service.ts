import { Injectable, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import Stripe from "stripe";

import { PaymentSessionDto } from "./dto";

import { envs } from "../config";

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);
  private readonly logger = new Logger("PaymentsService");

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items } = paymentSessionDto;

    const lineItems = items.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {},
      },
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3003/payments/success",
      cancel_url: "http://localhost:3003/payments/cancel",
    });

    return session;
  }

  async stripeWebhook(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"];

    let event: Stripe.Event;
    const endpoint_secret = "whsec_AEZKK84B3G5CE7pT2ePDXl5lbBEjfYju";

    try {
      event = this.stripe.webhooks.constructEvent(
        req["rawBody"],
        signature,
        endpoint_secret
      );
    } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
      return;
    }

    switch (event.type) {
      case "charge.succeeded":
        console.log({ event });
        break;
      default:
        this.logger.warn(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ signature });
  }
}
