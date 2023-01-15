import { type NextApiRequest, type NextApiResponse } from 'next';
import { getSession } from 'next-auth/react/index.js';
import Stripe from 'stripe';
import { env } from '../../env/server.mjs';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (req.method === 'POST' && !!session?.user?.stripe_customer) {
    try {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: session.user.stripe_customer,
        return_url: env.NEXTAUTH_URL,
      });
      if (!stripeSession.url) throw new Error('No stripe session url found');
      res.redirect(303, stripeSession.url);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      res.status(err.statusCode || 500).json(err.message);
    }
  }
  if (!session) {
    res.send({ error: 'Not authenticated' });
  }
};

export default handler;
