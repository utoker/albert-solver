import {
  Card,
  Container,
  Grid,
  Row,
  Spacer,
  Switch,
  Text,
} from '@nextui-org/react';
import { type NextPage } from 'next';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import Footer from '../../components/Footer';
import PriceCard from '../../components/PriceCard';
import {
  basicDescription0,
  basicDescription1,
  proDescription0,
  proDescription1,
} from '../../utils/Constants';

const Nav = dynamic(() => import('../../components/Nav'), {
  ssr: false,
});

const Index: NextPage = () => {
  // Plans
  const monthlyProPlan = {
    id: 'price_1MUYDKDjAm7fiR6h4X6jjAm5',
    name: 'Pro',
    price: 699,
    interval: 'month',
  };
  const yearlyProPlan = {
    id: 'price_1MUYDvDjAm7fiR6hrHhpTEbb',
    name: 'Pro',
    price: 6999,
    interval: 'year',
  };

  // States for Switch
  const [isMonthly, setIsMonthly] = useState(true);
  const [proButton, setProButton] = useState('');
  const [basicButton, setBasicButton] = useState('');

  // NextAuth Session
  const { data: session, status } = useSession();

  // Set Button Text
  useEffect(() => {
    if (status === 'authenticated' && session.user?.subscription === 'basic') {
      setBasicButton('Start Studying');
      setProButton('Subscribe');
    }
    if (status === 'authenticated' && session.user?.subscription === 'pro') {
      setProButton('Manage Subscription');
      setBasicButton('Manage Subscription');
    }
    if (status === 'unauthenticated') {
      setProButton('Create Account');
      setBasicButton('Create Account');
    }
  }, [session, status]);

  return (
    <>
      <Nav />
      <Spacer y={1} />
      <Container fluid>
        <Row justify="center" align="center">
          <Text
            h1
            css={{
              textGradient: '45deg, $blue600 -20%, $pink600 50%',
            }}
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
          <Grid.Container
            justify="center"
            css={{
              '@sm': {
                jc: 'space-between',
              },
            }}
          >
            {isMonthly && (
              <>
                <Grid>
                  <PriceCard //Basic
                    buttonText={basicButton}
                    interval="month"
                    price={0.0}
                    description0={basicDescription0}
                    description1={basicDescription1}
                    name="Basic"
                    planId={'basic'}
                  />
                  <Spacer y={1.5} />
                </Grid>
              </>
            )}

            {isMonthly && monthlyProPlan && (
              <Grid key={monthlyProPlan.id}>
                <PriceCard //Pro
                  buttonText={proButton}
                  interval={monthlyProPlan.interval}
                  price={monthlyProPlan.price}
                  description0={proDescription0}
                  description1={proDescription1}
                  name={monthlyProPlan.name}
                  planId={monthlyProPlan.id}
                />
              </Grid>
            )}
            {!isMonthly && (
              <>
                <Grid>
                  <PriceCard //Basic
                    buttonText={basicButton}
                    interval="year"
                    price={0.0}
                    description0={basicDescription0}
                    description1={basicDescription1}
                    name="Basic"
                    planId={'basic'}
                  />
                  <Spacer y={1.5} />
                </Grid>
              </>
            )}
            {!isMonthly && yearlyProPlan && (
              <Grid key={yearlyProPlan.id}>
                <PriceCard //Pro
                  buttonText={proButton}
                  interval={yearlyProPlan.interval}
                  price={yearlyProPlan.price}
                  description0={proDescription0}
                  description1={proDescription1}
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
    </>
  );
};

export default Index;
