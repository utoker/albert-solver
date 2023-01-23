import {
  Card,
  Container,
  Grid,
  Row,
  Spacer,
  Switch,
  Text,
} from '@nextui-org/react';
import { type GetServerSideProps, type NextPage } from 'next';
import { type BuiltInProviderType } from 'next-auth/providers';
import {
  type ClientSafeProvider,
  type LiteralUnion,
  useSession,
} from 'next-auth/react';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import Stripe from 'stripe';
import Footer from '../../components/Footer';
import PriceCard from '../../components/PriceCard';
import useSWR, { preload } from 'swr';
import { env } from '../../env/server.mjs';
import axios from 'axios';

const Nav = dynamic(() => import('../../components/Nav'), {
  ssr: false,
});

type Props = {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  >;
  plans: {
    id: string;
    name: string;
    price: number | null;
    currency: string;
    interval: Stripe.Price.Recurring.Interval | undefined;
    interval_count: number | undefined;
    description: string | null;
    metadata: Stripe.Metadata;
    active: boolean;
  }[];
};
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const NextStripePricingTable: NextPage<Props> = () => {
  const { data: plans } = useSWR('/api/stripe/get-prices', fetcher);
  const { data: authSession, status } = useSession();
  const [isMonthly, setIsMonthly] = useState(true);
  const [proButton, setProButton] = useState('');
  const [basicButton, setBasicButton] = useState('');

  const monthlyProPlan = plans.find(
    (plan: { interval: string; active: boolean }) =>
      plan.interval === 'month' && plan.active === true
  );
  const yearlyProPlan = plans.find(
    (plan: { interval: string; active: boolean }) =>
      plan.interval === 'year' && plan.active === true
  );

  useEffect(() => {
    if (
      status === 'authenticated' &&
      authSession.user?.subscription === 'basic'
    ) {
      setBasicButton('Start Studying');
      setProButton('Subscribe');
    }
    if (
      status === 'authenticated' &&
      authSession.user?.subscription === 'pro'
    ) {
      setProButton('Manage Subscription');
      setBasicButton('Manage Subscription');
    }
    if (status === 'unauthenticated') {
      setProButton('Create Account');
      setBasicButton('Create Account');
    }
  }, [authSession, status]);

  return (
    <div>
      <Nav />
      <Spacer y={2} />
      <Container>
        <Row justify="center" align="center">
          <Text
            h1
            size={'$4xl'}
            css={{
              textGradient: '45deg, $blue600 -20%, $pink600 50%',
            }}
            weight="bold"
          >
            Affordable Pricing
          </Text>
        </Row>
        <Container xs>
          <Row justify="center" align="center">
            <Card css={{ mw: 'max-content', px: '10px' }}>
              <Card.Body>
                <Text
                  size={'$xl'}
                  h2
                  css={{
                    textAlign: 'center',
                    textGradient: '45deg, $purple600 -20%, $pink600 100%',
                  }}
                >
                  Enjoy 40% off with the promo code 40OFF Only available for the
                  first 100 customers! 🔥
                </Text>
              </Card.Body>
            </Card>
          </Row>
          <Spacer y={1} />
          <Row justify="center">
            <Text h3>Monthly</Text>
            <Spacer x={0.5} />
            <Switch
              size="xl"
              checked={isMonthly}
              onChange={() => setIsMonthly((e) => !e)}
            />
          </Row>
          <Spacer y={0.5} />
          <Grid.Container justify="space-between">
            {isMonthly && (
              <>
                <Grid>
                  <PriceCard
                    buttonText={basicButton}
                    currency="usd"
                    interval="month"
                    price={0.0}
                    description1="10 questions per day"
                    description2="500 characters per question"
                    name="Basic"
                    planId={'basic'}
                  />
                  <Spacer y={1.5} />
                </Grid>
              </>
            )}

            {isMonthly && monthlyProPlan && (
              <Grid key={monthlyProPlan.id}>
                <PriceCard
                  buttonText={proButton}
                  currency={monthlyProPlan.currency}
                  interval={monthlyProPlan.interval}
                  price={monthlyProPlan.price}
                  description1="50 questions per day"
                  description2="5000 characters per question"
                  name={monthlyProPlan.name}
                  planId={monthlyProPlan.id}
                />
              </Grid>
            )}
            {!isMonthly && (
              <>
                <Grid>
                  <PriceCard
                    buttonText={basicButton}
                    currency="usd"
                    interval="year"
                    price={0.0}
                    description1="4 questions per day"
                    description2="400 characters per question"
                    name="Basic"
                    planId={'basic'}
                  />
                </Grid>
              </>
            )}
            {!isMonthly && yearlyProPlan && (
              <Grid key={yearlyProPlan.id}>
                <PriceCard
                  buttonText={proButton}
                  currency={yearlyProPlan.currency}
                  interval={yearlyProPlan.interval}
                  price={yearlyProPlan.price}
                  description1="40 questions per day"
                  description2="4000 characters per question"
                  name={yearlyProPlan.name}
                  key={yearlyProPlan.id}
                  planId={yearlyProPlan.id}
                />
              </Grid>
            )}
          </Grid.Container>
        </Container>
      </Container>
      <Spacer y={2} />
      <Footer />
    </div>
  );
};

export default NextStripePricingTable;

// ssr
// export const getServerSideProps: GetServerSideProps = async () => {
//   const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
//     apiVersion: '2022-11-15',
//   });
//   const { data: prices } = await stripe.prices.list();

//   const plans = await Promise.all(
//     prices.map(async (price) => {
//       const product = await stripe.products.retrieve(price.product.toString());
//       return {
//         id: price.id,
//         name: product.name,
//         price: price.unit_amount,
//         currency: price.currency,
//         interval: price.recurring?.interval,
//         interval_count: price.recurring?.interval_count,
//         description: product.description,
//         metadata: product.metadata,
//         active: price.active,
//       };
//     })
//   );
//   const sortPlans = plans.sort((a, b) => {
//     if (a.price && b.price) {
//       return a.price - b.price;
//     }
//     return 0;
//   });

//   return {
//     props: { plans: sortPlans },
//   };
// };
