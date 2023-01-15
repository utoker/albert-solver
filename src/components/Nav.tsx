/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { faDiscord, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Avatar,
  Button,
  Dropdown,
  Input,
  Link,
  Modal,
  Navbar,
  Row,
  Spacer,
  Text,
} from '@nextui-org/react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { type FC, useState, type Key } from 'react';
import { Logo } from './Logo';

const Nav: FC = () => {
  const { data: authData, status: authStatus } = useSession();

  const router = useRouter();

  const handleActionKey = async (actionKey: Key) => {
    switch (actionKey) {
      case 'logout':
        signOut({
          redirect: true,
          callbackUrl: '/',
        });
        break;
      case 'pro':
        router.push('/api/create-portal-session');
        break;
      case 'upgrade':
        router.push('/pricing');
        break;
    }
  };

  const [visible, setVisible] = useState(false);
  const modalHandler = () => setVisible(true);
  const closeHandler = () => {
    setVisible(false);
  };

  const [email, setEmail] = useState('');
  const sendLoginVerification = (e: React.SyntheticEvent) => {
    e.preventDefault();

    // Notice, we are also redirecting users to the protected route instead of the homepage after signing in.
    signIn('email', { callbackUrl: '/protected', email });
  };

  return (
    <>
      <Modal
        closeButton
        blur
        aria-labelledby="login"
        open={visible}
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
              onPress={() => signIn('discord', { callbackUrl: '/study-room' })}
              iconRight={<FontAwesomeIcon icon={faDiscord} />}
            >
              Sign in with Discord
            </Button>
          </Row>
          <Row justify="center">
            <Button
              size="lg"
              onPress={() => signIn('google', { callbackUrl: '/study-room' })}
              iconRight={<FontAwesomeIcon icon={faGoogle} />}
            >
              Sign in with Google
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

      <Navbar maxWidth={'fluid'} variant={'sticky'}>
        <Navbar.Brand>
          <Navbar.Toggle
            css={{
              '@xs': {
                w: '12%',
              },
            }}
            showIn="sm"
            aria-label="toggle-navigation"
            id="toggle-navigation"
          />
          <Logo />
          <Text b color="inherit" hideIn="xs">
            Albert Solver
          </Text>
        </Navbar.Brand>
        <Navbar.Content
          enableCursorHighlight
          hideIn="sm"
          activeColor="secondary"
        >
          <Navbar.Link isActive={router.route === '/'} href="/">
            Home
          </Navbar.Link>

          <Navbar.Link href="/pricing" isActive={router.route === '/pricing'}>
            Pricing
          </Navbar.Link>
          {authStatus === 'unauthenticated' ? (
            <Navbar.Link onClick={modalHandler}>Study Room</Navbar.Link>
          ) : (
            <Navbar.Link
              isActive={router.route === '/study-room'}
              href="/study-room"
            >
              Study Room
            </Navbar.Link>
          )}
        </Navbar.Content>
        {authStatus === 'unauthenticated' ? (
          <Navbar.Content>
            <Navbar.Item>
              <Button flat auto onPress={modalHandler}>
                Login
              </Button>
            </Navbar.Item>
          </Navbar.Content>
        ) : (
          <Navbar.Content
            css={{
              '@xs': {
                w: '12%',
                jc: 'flex-end',
              },
            }}
          >
            <Dropdown placement="bottom-right">
              <Navbar.Item>
                <Dropdown.Trigger>
                  <Avatar
                    bordered
                    as="button"
                    color="secondary"
                    size="md"
                    src={authData?.user?.image!}
                  />
                </Dropdown.Trigger>
              </Navbar.Item>
              <Dropdown.Menu
                aria-label="menu"
                id="menu"
                color="secondary"
                onAction={(actionKey) => handleActionKey(actionKey)}
              >
                <Dropdown.Item
                  textValue="signed in"
                  key="profile"
                  css={{ height: '$18' }}
                >
                  <Text b color="inherit" css={{ d: 'flex' }}>
                    Signed in as
                  </Text>
                  <Text b color="inherit" css={{ d: 'flex' }}>
                    {authData?.user?.email}
                  </Text>
                </Dropdown.Item>
                <Dropdown.Section
                  title={` ${authData?.user?.subscription.toUpperCase()} USER`}
                >
                  {authData?.user?.subscription === 'pro' ? (
                    <Dropdown.Item key={'pro'}>
                      Manage Subscription
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item key={'upgrade'}>
                      Upgrade to Pro
                    </Dropdown.Item>
                  )}
                </Dropdown.Section>
                {/* <Dropdown.Item key="help_and_feedback" withDivider>
              Help & Feedback
            </Dropdown.Item> */}
                <Dropdown.Item key="logout" withDivider color="error">
                  Log Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Navbar.Content>
        )}

        <Navbar.Collapse>
          <Navbar.CollapseItem
            activeColor="secondary"
            isActive={router.route === '/'}
          >
            <Link
              href="/"
              color="inherit"
              css={{
                minWidth: '100%',
              }}
            >
              Home
            </Link>
          </Navbar.CollapseItem>
          <Navbar.CollapseItem
            activeColor="secondary"
            isActive={router.route === '/pricing'}
          >
            <Link
              href="/pricing"
              color="inherit"
              css={{
                minWidth: '100%',
              }}
            >
              Pricing
            </Link>
          </Navbar.CollapseItem>
          <Navbar.CollapseItem
            activeColor="secondary"
            isActive={router.route === '/study-room'}
          >
            <Link
              href="/study-room"
              color="inherit"
              css={{
                minWidth: '100%',
              }}
            >
              Study Room
            </Link>
          </Navbar.CollapseItem>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
};

export default Nav;
