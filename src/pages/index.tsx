import { Container, Row, Spacer, Text } from '@nextui-org/react';
import { type NextPage } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Footer from '../components/Footer';
import { useTheme } from '@nextui-org/react';

// This is a workaround for hydration issues with Next.js
const Nav = dynamic(() => import('../components/Nav'), {
  ssr: false,
});

const Home: NextPage = () => {
  const { isDark } = useTheme();

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
      <Container fluid css={{ bc: '$qq' }}>
        <Row justify="center" align="center">
          <Text
            h1
            css={{
              pt: '$8',
              m: '$0',
              ta: 'center',
              lh: '$md',
              textGradient: '45deg, $blue600 -20%, $pink600 50%',
            }}
          >
            AI Writing Pro: Expert Support for Essays and Homework
          </Text>
        </Row>
        <Row justify="center" align="center">
          <Text
            hideIn={'sm'}
            h2
            css={{
              m: '$0',
              ta: 'center',
              lh: '$md',
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
              key={isDark ? '/video-dark.mp4' : '/video.mp4'}
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
              <source
                src={isDark ? '/video-dark.mp4' : '/video.mp4'}
                type="video/mp4"
              />
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
