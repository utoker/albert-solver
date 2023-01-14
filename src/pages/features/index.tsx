import { Card, Container, Row, Spacer, Text } from '@nextui-org/react';
import { type GetServerSideProps, type NextPage } from 'next';
import { type BuiltInProviderType } from 'next-auth/providers';
import {
  type ClientSafeProvider,
  getProviders,
  type LiteralUnion,
} from 'next-auth/react';
import React from 'react';
import Footer from '../../components/Footer';
import Nav from '../../components/Nav';

type Props = {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  >;
};

const Features: NextPage<Props> = ({ providers }) => {
  const features = [
    {
      title: 'Achieve success with an AI that adapts to you',
      description:
        "One of the key benefits of using AI on our website is its ability to adapt to the unique needs and goals of each student. Whether students are struggling with a particular concept or are looking to accelerate their learning, the AI can adjust itself to provide personalized assistance. It can adjust the difficulty of questions and materials based on students' performance, ensuring that they are challenged at an appropriate level and making progress towards their learning goals. This adaptive feature of the AI makes it an effective tool for students looking to improve their grades and achieve academic success.",
    },
    {
      title: 'Stay on track with real-time assistance',
      description:
        'Our website is designed to provide students with immediate assistance when they need it. Whether they have a quick question or a complex problem, our AI can provide real-time help. Students can submit their questions and receive detailed explanations and guidance in seconds, giving them the support they need to succeed in their subjects. With our real-time feature, students can get the help they need when they need it to stay on track with their studies.',
    },
    {
      title: 'Fine-tuned AI for accurate and reliable guidance',
      description:
        'Our AI has been expertly trained to provide students with the best possible assistance for their homework and assessments. It has a deep understanding of a wide range of subjects, and its knowledge base is constantly being updated and fine-tuned to ensure that it can provide accurate and reliable guidance. Whether students need help with math, science, English, or any other subject, our AI is equipped to provide the support they need to succeed. Its expert training makes it a valuable resource for students looking to improve their grades and achieve their academic goals.',
    },
  ];
  return (
    <>
      <Nav providers={providers} />
      <Spacer y={2} />
      <Container>
        <Row justify="center" align="center">
          <Text
            h1
            size={'$4xl'}
            css={{
              textGradient: '45deg, $blue600 -20%, $pink600 50%',
            }}
            weight="bold"
          >
            Features
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
            Get instant help with your homework and assessments!
          </Text>
        </Row>
        <Spacer />
        <Container>
          {features.map((feature, i) => (
            <Container key={i}>
              <Card>
                <Card.Header>
                  <Text b>{feature.title}</Text>
                </Card.Header>
                <Card.Body>
                  <Text>{feature.description}</Text>
                </Card.Body>
              </Card>
              <Spacer />
            </Container>
          ))}
        </Container>
        <Spacer />
      </Container>
      <Footer />
    </>
  );
};

export default Features;

export const getServerSideProps: GetServerSideProps = async () => {
  const providers = await getProviders();
  return {
    props: { providers },
  };
};
