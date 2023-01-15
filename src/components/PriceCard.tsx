import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Col, Row, Button, Text, Spacer } from '@nextui-org/react';
import { type NextPage } from 'next';
import { signIn } from 'next-auth/react';
import NextLink from 'next/link';
import type Stripe from 'stripe';

//todo - add modal for signing in

type Props = {
  planId?: string;
  buttonText: string;
  name: string;
  price: number | null;
  currency: string;
  interval: Stripe.Price.Recurring.Interval | undefined;
  description1?: string | null;
  description2?: string | null;
};

const PriceCard: NextPage<Props> = ({
  description1,
  description2,
  name,
  price,
  interval,
  buttonText,
  planId,
}) => {
  return (
    <Card css={{ mw: '320px' }}>
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
          {buttonText === 'Start Studying' && (
            <NextLink href="/study-room" passHref>
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
            </NextLink>
          )}

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
        <Spacer y={2} />
      </Card.Body>
      <Card.Footer
        css={{
          borderTop: '$borderWeights$light solid $colors$border',
        }}
      >
        <Col>
          <Row wrap="wrap" justify="space-between" align="center">
            <Text b>This includes:</Text>
          </Row>
          <Row wrap="wrap" justify="space-between" align="center">
            <Text>
              <FontAwesomeIcon
                icon={faCheck}
                style={{ paddingRight: '4px', color: '#7828c8' }}
              />
              {description1}
            </Text>
          </Row>
          <Row wrap="wrap" justify="space-between" align="center">
            <Text>
              <FontAwesomeIcon
                icon={faCheck}
                style={{ paddingRight: '4px', color: '#7828c8' }}
              />
              {description2}
            </Text>
          </Row>
        </Col>
      </Card.Footer>
    </Card>
  );
};

export default PriceCard;
