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
    const { currency, items, orderId } = paymentSessionDto;

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
        metadata: {
          orderId,
        },
      },
      line_items: lineItems,
      mode: "payment",
      success_url: envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelUrl,
    });

    return {
      cancelUrl: session.cancel_url,
      successUrl: session.success_url,
      url: session.url,
    };
  }

  async stripeWebhook(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"];

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req["rawBody"],
        signature,
        envs.stripeEndpointSecret
      );
    } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
      return;
    }

    switch (event.type) {
      case "charge.succeeded":
        const {
          metadata: { orderId },
        } = event.data.object;
        this.logger.log(`Charge succeeded for order: ${orderId}`);
        // TODO: Connect to order microservice to update order status
        break;
      default:
        this.logger.warn(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ signature });
  }
}
