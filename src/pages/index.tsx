import { Container, Row, Spacer, Text } from '@nextui-org/react';
import { type NextPage } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import { useState } from 'react';
import GetStarted from '../components/GetStarted';
import Video from '../components/Video';

// This is a workaround for hydration issues with Next.js
const Nav = dynamic(() => import('../components/Nav'), {
  ssr: false,
});

const Home: NextPage = () => {
  // Login Modal
  const [visible, setVisible] = useState(false);
  const closeHandler = () => {
    setVisible(false);
  };

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
      <LoginModal isOpen={visible} closeHandler={closeHandler} />
      <Nav />
      <Container
        fluid
        css={{ bc: '$qq' }}
        display="flex"
        alignItems="center"
        direction="column"
      >
        <Row justify="center" align="center">
          <Text
            h1
            css={{
              pt: '$8',
              m: '$0',
              ta: 'center',
              textGradient: '45deg, $blue600 -20%, $pink600 50%',
            }}
          >
            AI Writing Pro: Expert Support for Essays and Homework
          </Text>
        </Row>
        <Row justify="center">
          <Text
            hideIn={'sm'}
            h2
            css={{
              m: '$0',
              ta: 'center',
              textGradient: '45deg, $purple600 -20%, $pink600 100%',
            }}
          >
            Achieve academic success with our advanced assistance!
          </Text>
        </Row>
        <Spacer y={2} />
        <GetStarted setVisible={setVisible} />
        <Spacer y={5} />
        <Video />
      </Container>
      <Spacer y={2} />
      <Footer />
    </>
  );
};

export default Home;
