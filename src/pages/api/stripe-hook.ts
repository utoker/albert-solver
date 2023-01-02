import { type NextApiRequest, type NextApiResponse } from 'next';
import Stripe from 'stripe';
import { env } from '../../env/server.mjs';
import { buffer } from 'micro';
import { prisma } from '../../server/db/client';

export const config = { api: { bodyParser: false } };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
  });
  const signature = req.headers['stripe-signature'];
  const singinSecret = env.STRIPE_SINGIN_SECRET;
  const reqBuffer = await buffer(req);

  let event;
  if (!!signature) {
    try {
      event = stripe.webhooks.constructEvent(
        reqBuffer,
        signature,
        singinSecret
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log('stripe-hook error', error);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  } else {
    console.log('stripe-hook error', 'no signature');
    return res.status(400).send(`Webhook Error: no signature`);
  }

  // Handle the event
  let subscription;
  let status;
  switch (event.type) {
    case 'customer.subscription.created':
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paymentIntent: any = event.data.object;
      // Then define and call a function to handle the event payment_intent.succeeded
      const user = await prisma.user.findFirst({
        where: {
          stripe_customer: paymentIntent.customer,
        },
      });
      await prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          subscription: 'pro',
        },
      });
    case 'customer.subscription.trial_will_end':
      subscription = event.data.object;
      status = subscription;
      console.log(`Subscription status is ${status}.`);
      // Then define and call a method to handle the subscription trial ending.
      // handleSubscriptionTrialEnding(subscription);
      break;
    case 'customer.subscription.deleted':
      subscription = event.data.object;
      status = subscription;
      console.log(`Subscription status is ${status}.`);
      // Then define and call a method to handle the subscription deleted.
      // handleSubscriptionDeleted(subscriptionDeleted);
      break;
    case 'customer.subscription.updated':
      subscription = event.data.object;
      status = subscription;
      console.log(`Subscription status is ${status}.`);
      // Then define and call a method to handle the subscription update.
      // handleSubscriptionUpdated(subscription);
      break;

      break;
    case 'checkout.session.completed':
      break;
    // ... handle other event types
    default:
    // console.log(`Unhandled event type ${event.type}`);
  }

  res.send({ recived: true });
};

export default handler;
