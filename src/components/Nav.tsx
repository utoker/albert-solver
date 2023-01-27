import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Avatar,
  Button,
  Dropdown,
  Image,
  Link,
  Navbar,
  Row,
  Switch,
  Text,
  useTheme,
} from '@nextui-org/react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { type FC, useState, type Key } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import LoginModal from './LoginModal';

const Nav: FC = () => {
  const { data: authData, status: authStatus } = useSession();
  const { setTheme } = useNextTheme();
  const { isDark } = useTheme();
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
        router.push('/api/stripe/create-portal-session');
        break;
      case 'upgrade':
        router.push('/pricing');
        break;
      case 'dark':
        setTheme(isDark ? 'light' : 'dark');
        break;
    }
  };

  const [visible, setVisible] = useState(false);
  const modalHandler = () => setVisible(true);
  const closeHandler = () => {
    setVisible(false);
  };

  return (
    <>
      <LoginModal isOpen={visible} closeHandler={closeHandler} />
      <Navbar maxWidth="fluid" variant="sticky">
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
          <Link href="/" color="inherit" css={{ ml: '$6' }}>
            {isDark ? (
              <Image src="/logo.png" alt="Logo" height={36} width={36} />
            ) : (
              <Image src="/logo.png" alt="Logo" height={36} width={36} />
            )}
            <Text b color="inherit" hideIn="xs" css={{ mt: '$4' }}>
              Albert Solver
              <Text
                css={{
                  mt: '-36px',
                  fontSize: '$xs',
                  color: '$secondary',
                }}
              >
                OPEN BETA
              </Text>
            </Text>
          </Link>
        </Navbar.Brand>
        <Navbar.Content
          enableCursorHighlight
          hideIn="xs"
          activeColor="secondary"
          variant="highlight"
        >
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

        <Navbar.Content>
          <Navbar.Item>
            <Button
              flat
              auto
              onPress={() => setTheme(isDark ? 'light' : 'dark')}
              icon={<FontAwesomeIcon icon={isDark ? faSun : faMoon} />}
            />
          </Navbar.Item>
          {authStatus === 'unauthenticated' ? (
            <Navbar.Item>
              <Button flat auto onPress={modalHandler}>
                Login
              </Button>
            </Navbar.Item>
          ) : (
            <Dropdown placement="bottom-right" closeOnSelect={false}>
              <Navbar.Item>
                <Dropdown.Trigger>
                  <Avatar
                    squared
                    bordered
                    as="button"
                    color="secondary"
                    size="md"
                    src={
                      authData?.user?.image
                        ? authData.user.image
                        : '/user-avatar.png'
                    }
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
                <Dropdown.Item key="dark" textValue="Dark Mode">
                  <Row justify="space-between">
                    <Text>Dark Mode</Text>
                    <Switch
                      checked={isDark}
                      onChange={(e) =>
                        setTheme(e.target.checked ? 'dark' : 'light')
                      }
                    />
                  </Row>
                </Dropdown.Item>
                {/* <Dropdown.Item key="help_and_feedback" withDivider>
              Help & Feedback
            </Dropdown.Item> */}
                <Dropdown.Item key="logout" withDivider color="error">
                  Log Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </Navbar.Content>

        <Navbar.Collapse css={{ bg: '$bg' }}>
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
          <Navbar.CollapseItem activeColor="secondary">
            {authStatus === 'unauthenticated' ? (
              <Link onClick={modalHandler}>Study Room</Link>
            ) : (
              <Link href="/study-room">Study Room</Link>
            )}
            {/* <Link
              href="/study-room"
              color="inherit"
              css={{
                minWidth: '100%',
              }}
            >
              Study Room
            </Link> */}
          </Navbar.CollapseItem>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
};

export default Nav;
