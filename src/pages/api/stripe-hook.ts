import { type NextApiRequest, type NextApiResponse } from 'next';
import Stripe from 'stripe';
import { env } from '../../env/server.mjs';
// import { buffer } from 'micro';
import { prisma } from '../../server/db/client';

export const config = { api: { bodyParser: false } };
//to start listening to stripe events
//stripe listen --forward-to localhost:3000/api/stripe-hook

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
  });
  const signature = req.headers['stripe-signature'];
  const singinSecret = env.STRIPE_SINGIN_SECRET;
  // const reqBuffer = await buffer(req);

  let event;
  if (!!signature) {
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, singinSecret);
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paymentIntent: any = event.data.object;
  switch (event.type) {
    case 'customer.subscription.created':
      // Then define and call a function to handle the event payment_intent.succeeded
      console.log('EVENT', event);
      try {
        await prisma.user.update({
          where: {
            stripe_customer: paymentIntent.customer,
          },
          data: {
            subscription: 'pro',
          },
        });
      } catch (error) {
        console.log(error);
      }

    case 'customer.subscription.trial_will_end':
      console.log('customer.subscription.trial_will_end', 'event', event);
      // Then define and call a method to handle the subscription trial ending.
      // handleSubscriptionTrialEnding(subscription);
      break;
    case 'customer.subscription.deleted':
      console.log('customer.subscription.deleted', 'event', event);
      // Then define and call a method to handle the subscription deleted.
      // handleSubscriptionDeleted(subscriptionDeleted);
      try {
        await prisma.user.update({
          where: {
            stripe_customer: paymentIntent.customer,
          },
          data: {
            subscription: 'basic',
          },
        });
      } catch (error) {
        console.log(error);
      }
      break;
    case 'customer.subscription.updated':
      console.log('customer.subscription.updated', 'event', event);

      try {
        await prisma.user.update({
          where: {
            stripe_customer: paymentIntent.customer,
          },
          data: {
            subscriptionEnd: paymentIntent.current_period_end,
          },
        });
      } catch (error) {
        console.log(error);
      }
      // Then define and call a method to handle the subscription update.
      // handleSubscriptionUpdated(subscription);
      break;

      break;
    case 'checkout.session.completed':
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.send({ recived: true });
};

export default handler;
