import { Button, Col, Row, Text } from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { type Dispatch, type SetStateAction, type FC } from 'react';

type Props = {
  setVisible: Dispatch<SetStateAction<boolean>>;
};

const GetStarted: FC<Props> = ({ setVisible }) => {
  const { data: session } = useSession();
  const route = useRouter();
  return (
    <Row
      align="center"
      justify="center"
      wrap="wrap"
      css={{
        mw: '960px',
        '@xs': {
          flexWrap: 'nowrap',
          jc: 'space-between',
        },
      }}
    >
      <Col css={{ mw: '960px' }}>
        {/* <Text h3>Try your best assistant, Be a Basic User in a second.</Text> */}
        <Text h4>
          Getting started is easy - all you need to do is a single click! No
          password is required - we&apos;ve made it simple and secure for you to
          access your account. Once you&apos;re in, you&apos;ll be able to
          explore all the features. Enjoy!
        </Text>
      </Col>
      {session ? (
        <Button
          color="secondary"
          size="xl"
          onPress={() => route.push('/study-room')}
        >
          Get Started
        </Button>
      ) : (
        <Button color="secondary" size="xl" onPress={() => setVisible(true)}>
          Get Started
        </Button>
      )}
    </Row>
  );
};

export default GetStarted;
