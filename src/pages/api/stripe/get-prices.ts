import { type NextApiRequest, type NextApiResponse } from 'next';
import { env } from '../../../env/server.mjs';
import Stripe from 'stripe';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
  });

  const { data: prices } = await stripe.prices.list();

  const plans = await Promise.all(
    prices.map(async (price) => {
      const product = await stripe.products.retrieve(price.product.toString());
      return {
        id: price.id,
        name: product.name,
        price: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
        interval_count: price.recurring?.interval_count,
        description: product.description,
        metadata: product.metadata,
        active: price.active,
      };
    })
  );

  const sortedPlans = plans.sort((a, b) => {
    if (a.price && b.price) {
      return a.price - b.price;
    }
    return 0;
  });

  res.status(200).json(sortedPlans);
};

export default handler;
