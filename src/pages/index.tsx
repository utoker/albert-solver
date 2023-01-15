import { Container, Row, Spacer, Text } from '@nextui-org/react';
import { type NextPage } from 'next';
import dynamic from 'next/dynamic';
import Footer from '../components/Footer';

// This is a workaround for hydration issues with Next.js
const Nav = dynamic(() => import('../components/Nav'), {
  ssr: false,
});

const Home: NextPage = () => {
  return (
    <>
      <Nav />
      <Spacer y={2} />
      <Container lg>
        <Row justify="center" align="center">
          <Text
            h1
            size={'$4xl'}
            css={{
              textGradient: '45deg, $blue600 -20%, $pink600 50%',
            }}
            weight="bold"
          >
            Ace Your Homework
          </Text>
        </Row>
        <Spacer />
        <Row justify="center" align="center">
          <Text
            hideIn={'sm'}
            size={'$3xl'}
            h2
            css={{
              textGradient: '45deg, $purple600 -20%, $pink600 100%',
            }}
          >
            Our advanced technology takes the stress out of homework!
          </Text>
        </Row>
        <Spacer y={2} />
        <Row
          justify="center"
          align="center"
          css={{ justifyContent: 'center' }}
        ></Row>
      </Container>
      <Footer />
    </>
  );
};

export default Home;
