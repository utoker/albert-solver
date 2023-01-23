import {
  Card,
  Container,
  Grid,
  Row,
  Spacer,
  Switch,
  Text,
} from '@nextui-org/react';
import axios from 'axios';
import { type NextPage } from 'next';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import type Stripe from 'stripe';
import useSWR, { preload } from 'swr';
import Footer from '../../components/Footer';
import PriceCard from '../../components/PriceCard';

const Nav = dynamic(() => import('../../components/Nav'), {
  ssr: false,
});

type plan = {
  id: string;
  name: string;
  price: number | null;
  currency: string;
  interval: Stripe.Price.Recurring.Interval | undefined;
  interval_count: number | undefined;
  description: string | null;
  metadata: Stripe.Metadata;
  active: boolean;
};

const fetcher = (url: string) => axios.get(url).then((res) => res.data);
preload('/api/stripe/get-prices', fetcher);

const NextStripePricingTable: NextPage = () => {
  const { data: plans } = useSWR('/api/stripe/get-prices', fetcher);
  const { data: authSession, status } = useSession();
  const [isMonthly, setIsMonthly] = useState(true);
  const [proButton, setProButton] = useState('');
  const [basicButton, setBasicButton] = useState('');

  console.log(plans);
  const monthlyProPlan = plans?.find(
    (plan: plan) => plan.interval === 'month' && plan.active === true
  );
  const yearlyProPlan = plans?.find(
    (plan: plan) => plan.interval === 'year' && plan.active === true
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
