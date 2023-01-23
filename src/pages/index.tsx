import { Container, Row, Spacer, Text } from '@nextui-org/react';
import { type NextPage } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
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
      <Head>
        <title>Albert Solver - Elevate your writing with AI</title>
        <link
          key={'canonical'}
          rel="canonical"
          href="https://albertsolver.com/"
        />

        <meta
          name="title"
          content="Albert Solver - Elevate your writing with AI"
        />
        <meta
          name="description"
          content="AI Writing Assistant is your go-to solution for expert help with essays and homework. Using cutting-edge technology, we provide advanced grammar checking, style suggestions, and personalized feedback to improve your writing and achieve academic success. Start seeing results with our AI-powered writing coach today."
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://albertsolver.com/" />
        <meta
          property="og:title"
          content="Albert Solver - Elevate your writing with AI"
        />
        <meta
          property="og:description"
          content="AI Writing Assistant is your go-to solution for expert help with essays and homework. Using cutting-edge technology, we provide advanced grammar checking, style suggestions, and personalized feedback to improve your writing and achieve academic success. Start seeing results with our AI-powered writing coach today."
        />
        <meta
          property="og:image"
          content="https://albertsolver.com/images/banner.png"
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://albertsolver.com/" />
        <meta
          property="twitter:title"
          content="Albert Solver - Elevate your writing with AI"
        />
        <meta
          property="twitter:description"
          content="AI Writing Assistant is your go-to solution for expert help with essays and homework. Using cutting-edge technology, we provide advanced grammar checking, style suggestions, and personalized feedback to improve your writing and achieve academic success. Start seeing results with our AI-powered writing coach today."
        />
        <meta
          property="twitter:image"
          content="https://albertsolver.com/images/banner.png"
        />
      </Head>
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
