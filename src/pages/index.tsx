import { Container, Row, Spacer, Text } from '@nextui-org/react';
import { type NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import Footer from '../components/Footer';

// This is a workaround for hydration issues with Next.js
const Nav = dynamic(() => import('../components/Nav'), {
  ssr: false,
});

const Home: NextPage = () => {
  const video = useRef<HTMLVideoElement>(null);
  return (
    <>
      <Nav />
      <Spacer y={1} />
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
        <Spacer y={0.5} />
        <Row justify="center" align="center">
          <div style={{ position: 'relative' }}>
            <video
              ref={video}
              loop
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                maxWidth: '772px',
                height: 'auto',
                border: '1px solid #7a28c7',
                borderRadius: '10px',
              }}
            >
              <source src="./video.mp4" type="video/mp4" />
            </video>
          </div>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default Home;
