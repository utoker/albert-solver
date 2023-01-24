import { faDiscord, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input, Modal, Row, Spacer, Text } from '@nextui-org/react';
import { signIn } from 'next-auth/react';
import React, { useState, type FC } from 'react';

type Props = {
  isOpen: boolean;
  closeHandler: () => void;
};

const LoginModal: FC<Props> = ({ isOpen, closeHandler }) => {
  const [email, setEmail] = useState('');
  const sendLoginVerification = (e: React.SyntheticEvent) => {
    e.preventDefault();
    signIn('email', { callbackUrl: '/study-room', email });
  };

  return (
    <Modal
      css={{ bc: '$background' }}
      closeButton
      blur
      aria-labelledby="login"
      open={isOpen}
      onClose={closeHandler}
    >
      <Modal.Header>
        <Text id="login" size="$xl">
          Welcome to{' '}
          <Text b size="$2xl">
            Albert Solver
          </Text>
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Row justify="center">
          <Button
            size="lg"
            onPress={() => signIn('google', { callbackUrl: '/study-room' })}
            iconRight={<FontAwesomeIcon icon={faGoogle} />}
          >
            Sign in with Google
          </Button>
        </Row>
        <Row justify="center">
          <Button
            size="lg"
            onPress={() => signIn('discord', { callbackUrl: '/study-room' })}
            iconRight={<FontAwesomeIcon icon={faDiscord} />}
          >
            Sign in with Discord
          </Button>
        </Row>
        {/* 🪄 */}
        <Row justify="center">
          <form
            onSubmit={sendLoginVerification}
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Input
              label="Email"
              type="email"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <Spacer y={0.5} />
            <Button
              auto
              size="lg"
              type="submit"
              iconRight={<FontAwesomeIcon icon={faEnvelope} />}
            >
              Sign in with Email
            </Button>
          </form>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Row>
          <Text size="$xs">
            If you don&apos;t have an account, one will be created for you
            automatically.
          </Text>
        </Row>
        <Row>
          <Text size="$xs">
            Please use the same provider to login into your account in the
            future.
          </Text>
        </Row>
      </Modal.Footer>
    </Modal>
  );
};

export default LoginModal;
