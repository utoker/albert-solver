import { Card, Container, Row, Spacer, Switch, Text } from '@nextui-org/react';
import { type GetServerSideProps, type NextPage } from 'next';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import Stripe from 'stripe';
import PriceCard from '../../components/PriceCard';
import { env } from '../../env/server.mjs';

type Props = {
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

const NextStripePricingTable: NextPage<Props> = ({ plans }) => {
  const { data: authSession, status } = useSession();
  const [isMonthly, setIsMonthly] = useState(true);
  const [proButton, setProButton] = useState('');
  const [basicButton, setBasicButton] = useState('');

  useEffect(() => {
    if (
      status === 'authenticated' &&
      authSession.user?.subscription === 'basic'
    ) {
      setBasicButton('Manage Subscription');
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
      <Spacer y={2} />
      <Container xs>
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
        {/* <Spacer y={2} /> */}
        <Row justify="center" align="center">
          <Card>
            <Card.Body>
              <Text
                hideIn={'sm'}
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
        <Spacer y={2} />
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
        <Row>
          <PriceCard
            buttonText={basicButton}
            name="Basic"
            price={0}
            currency="usd"
            interval="month"
            description=""
          />
          <Spacer x={2} />
          {isMonthly
            ? plans
                .filter((plan) => plan.interval === 'month' && plan.active)
                .map((plan) => (
                  <PriceCard
                    buttonText={proButton}
                    currency={plan.currency}
                    interval={plan.interval}
                    price={plan.price}
                    description={plan.description}
                    name={plan.name}
                    key={plan.id}
                    planId={plan.id}
                  />
                ))
            : plans
                .filter((plan) => plan.interval === 'year' && plan.active)
                .map((plan) => (
                  <PriceCard
                    buttonText={proButton}
                    currency={plan.currency}
                    interval={plan.interval}
                    price={plan.price}
                    description={plan.description}
                    name={plan.name}
                    key={plan.id}
                    planId={plan.id}
                  />
                ))}
        </Row>
      </Container>
      <Spacer y={2} />
    </div>
  );
};

export default NextStripePricingTable;

// ssr
export const getServerSideProps: GetServerSideProps = async () => {
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
  const sortPlans = plans.sort((a, b) => {
    if (a.price && b.price) {
      return a.price - b.price;
    }
    return 0;
  });

  return {
    props: { plans: sortPlans },
  };
};
