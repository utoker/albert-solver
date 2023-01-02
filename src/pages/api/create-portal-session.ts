import { type NextApiRequest, type NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import Stripe from 'stripe';
import { env } from '../../env/server.mjs';
import { authOptions } from './auth/[...nextauth]';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const authSession = await unstable_getServerSession(req, res, authOptions);

  if (req.method === 'POST' && !!authSession?.user?.stripe_customer) {
    try {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: authSession.user.stripe_customer,
        return_url: env.NEXTAUTH_URL,
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
