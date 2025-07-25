import Stripe from 'stripe';
import config from '../../config';

const stripe = new Stripe(config.stripe?.stripe_api_secret as string, {
  apiVersion: "2025-03-31.basil",
  typescript: true,
});

interface IPayload {
  product: {
    amount: number;
    name: string;
    quantity: number;
  };
  // customerId: string;
  paymentId: string;
}
export const createCheckoutSession = async (payload: IPayload) => {
  const paymentGatewayData = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: payload?.product?.name,
          },
          unit_amount: Math.round(payload.product?.amount * 100),
        },
        quantity: payload.product?.quantity,
      },
    ],

    success_url: `${config.SERVER_URL}/payments/confirm-payment?sessionId={CHECKOUT_SESSION_ID}&paymentId=${payload?.paymentId}`,

    cancel_url: `${config?.client_Url}${config?.cancel_url}`,

    // `${config.server_url}/payments/cancel?paymentId=${payload?.paymentId}`,
    mode: 'payment',
    // metadata: {
    //   user: JSON.stringify({
    //     paymentId: payment.id,
    //   }),
    // },
    invoice_creation: {
      enabled: true,
    },
    // customer: payload?.customerId,
    // payment_intent_data: {
    //   metadata: {
    //     payment: JSON.stringify({
    //       ...payment,
    //     }),
    //   },
    // },
    // payment_method_types: ['card', 'amazon_pay', 'cashapp', 'us_bank_account'],
    payment_method_types: ['card'], //, 'paypal'
  });
  return paymentGatewayData;
};
