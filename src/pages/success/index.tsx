import { Button, Card, Container, Link, Spacer, Text } from '@nextui-org/react';
import { type NextPage } from 'next';
import React from 'react';
import Nav from '../../components/Nav';

const Success: NextPage = () => {
  return (
    <>
      <Nav />
      <Container
        gap={0.1}
        sm
        display="flex"
        direction="column"
        justify="center"
        alignContent="center"
      >
        <Spacer y={2} />
        <Card variant="shadow" css={{ w: '100%' }}>
          <Card.Header css={{ jc: 'center' }}>
            <Text
              h1
              // size={'$4xl'}
              css={{
                textGradient: '45deg, $blue600 -20%, $pink600 50%',
              }}
            >
              Payment Successful!
            </Text>
          </Card.Header>
          <Card.Body>
            <Text
              // size={'$3xl'}
              h3
              css={{
                textGradient: '45deg, $purple600 -20%, $pink600 100%',
              }}
            >
              Thank you for subscribing! Your payment has been received and
              processed successfully. You can now enjoy all the features of our
              service. If you have any questions or concerns, please don&apos;t
              hesitate to contact us. We&apos;re always happy to help!
            </Text>
          </Card.Body>
          <Card.Footer css={{ jc: 'center' }}>
            <Link href="/study-room">
              <Button color="secondary" size="xl">
                Start Studying
              </Button>
            </Link>
          </Card.Footer>
        </Card>
      </Container>
    </>
  );
};

export default Success;
