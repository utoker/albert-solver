import { type NextApiRequest, type NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import Stripe from 'stripe';
import { env } from '../../../env/server.mjs';
import { authOptions } from '../auth/[...nextauth]';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const authSession = await unstable_getServerSession(req, res, authOptions);

  if (
    req.method === 'POST' &&
    !!authSession &&
    typeof req.query.priceId === 'string'
  ) {
    try {
      const { priceId } = req.query;
      const lineItems = [{ price: priceId, quantity: 1 }];
      const stripeSession = await stripe.checkout.sessions.create({
        customer: authSession.user?.stripe_customer,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: `${env.NEXTAUTH_URL}/api/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.NEXTAUTH_URL}/api/subscription/cancel`,
      });
      if (!stripeSession.url) throw new Error('No stripe session url found');
      res.redirect(303, stripeSession.url);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      res.status(err.statusCode || 500).json(err.message);
    }
  }
  if (!authSession) {
    res.send({ error: 'Not authenticated' });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

export default handler;
