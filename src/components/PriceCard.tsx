import { Card, Col, Row, Button, Text, Spacer } from '@nextui-org/react';
import { type NextPage } from 'next';
import { signIn } from 'next-auth/react';
import type Stripe from 'stripe';

type Props = {
  planId?: string;
  buttonText: string;
  name: string;
  price: number | null;
  currency: string;
  interval: Stripe.Price.Recurring.Interval | undefined;
  //   interval_count: number | undefined;
  description?: string | null;
  //   metadata: Stripe.Metadata;
};

const PriceCard: NextPage<Props> = ({
  name,
  price,
  interval,
  buttonText,
  planId,
}) => {
  return (
    <Card css={{ w: '100%', h: '400px' }}>
      <Card.Header css={{ padding: '$10 $10 0 $10' }}>
        <Col>
          <Text h3 color="black" size="$5xl">
            {name}
          </Text>
        </Col>
      </Card.Header>
      <Spacer y={0.5} />
      <Card.Body css={{ padding: '0 $10 0 $10' }}>
        <Row>
          <Col css={{ width: 'min-content' }}>
            <Text h4 size={'$4xl'}>
              ${price && price / 100}
            </Text>
          </Col>
          <Spacer x={0.5} />
          <Col>
            <Text css={{ lineHeight: '$md' }}>
              per <br /> {interval}
            </Text>
          </Col>
        </Row>
        <Spacer y={1} />
        <Row>
          {buttonText === 'Subscribe' && (
            <form
              action={`/api/subscriptions/${planId}`}
              method="POST"
              role="link"
            >
              <Button
                auto
                color="secondary"
                css={{ width: '100%' }}
                type="submit"
              >
                <Text
                  css={{ color: 'inherit' }}
                  size="$lg"
                  weight="bold"
                  transform="uppercase"
                >
                  {buttonText}
                </Text>
              </Button>
            </form>
          )}

          {buttonText === 'Manage Subscription' && (
            <form
              action={`/api/create-portal-session`}
              method="POST"
              role="link"
            >
              <Button
                auto
                color="secondary"
                css={{ width: '100%' }}
                type="submit"
              >
                <Text
                  css={{ color: 'inherit' }}
                  size="$lg"
                  weight="bold"
                  transform="uppercase"
                >
                  {buttonText}
                </Text>
              </Button>
            </form>
          )}
          {buttonText === 'Create Account' && (
            <Button
              auto
              color="secondary"
              css={{ width: '100%' }}
              onPress={() => signIn(undefined, { callbackUrl: '/pricing' })}
            >
              <Text
                css={{ color: 'inherit' }}
                size="$lg"
                weight="bold"
                transform="uppercase"
              >
                {buttonText}
              </Text>
            </Button>
          )}
        </Row>
      </Card.Body>
      <Card.Footer>
        <Text>includes 14 days free trial</Text>
        <Text>includes 14 days free trial</Text>
      </Card.Footer>
    </Card>
  );
};

export default PriceCard;
