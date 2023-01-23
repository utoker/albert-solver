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
      <Spacer y={1.5} />
      <Container lg>
        <Row justify="center" align="center">
          <Text
            h1
            css={{
              m: '$0',
              ta: 'center',
              lh: '$xs',
              textGradient: '45deg, $blue600 -20%, $pink600 50%',
            }}
          >
            AI Writing Pro: Expert Support for Essays and Homework
          </Text>
        </Row>
        <Spacer y={1} />
        <Row justify="center" align="center">
          <Text
            hideIn={'sm'}
            h2
            css={{
              m: '$0',
              ta: 'center',
              lh: '$xs',
              textGradient: '45deg, $purple600 -20%, $pink600 100%',
            }}
          >
            Achieve academic success with our advanced assistance!
          </Text>
        </Row>
        <Spacer y={1.5} />
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
                maxWidth: '960px',
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
      <Spacer y={1} />
      <Footer />
    </>
  );
};

export default Home;
