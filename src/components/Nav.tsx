/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Avatar,
  Button,
  Dropdown,
  Link,
  Navbar,
  Text,
} from '@nextui-org/react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { type Key } from 'react';
import { Logo } from './Logo';

const Nav = () => {
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
      case 'settings':
        router.push('/settings');
        break;
    }
  };

  const collapseItems = [
    'Profile',
    'Dashboard',
    'Activity',
    'Analytics',
    'System',
    'Deployments',
    'My Settings',
    'Team Settings',
    'Help & Feedback',
    'Log Out',
  ];

  return (
    <Navbar maxWidth={'fluid'} variant={'sticky'}>
      <Navbar.Brand>
        <Navbar.Toggle
          css={{
            '@xs': {
              w: '12%',
            },
          }}
          showIn="xs"
          aria-label="toggle-navigation"
          id="toggle-navigation"
        />
        <Logo />
        <Text b color="inherit" hideIn="xs">
          Homework AI
        </Text>
      </Navbar.Brand>
      <Navbar.Content enableCursorHighlight hideIn="xs" activeColor="secondary">
        <Navbar.Link isActive={router.route === '/'} href="/">
          Home
        </Navbar.Link>
        <Navbar.Link
          isActive={router.route === '/study-room'}
          href="/study-room"
        >
          Study Room
        </Navbar.Link>
        <Navbar.Link isActive={router.route === '/features'} href="/features">
          Features
        </Navbar.Link>
        <Navbar.Link href="/pricing" isActive={router.route === '/pricing'}>
          Pricing
        </Navbar.Link>
      </Navbar.Content>
      {authStatus === 'unauthenticated' ? (
        <Navbar.Content>
          <Navbar.Link href="/api/auth/signin" color="inherit">
            Login
          </Navbar.Link>
          <Navbar.Item>
            <Button auto flat as={Link} href="/api/auth/signin">
              Sign Up
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
              <Dropdown.Item key="profile" css={{ height: '$18' }}>
                <Text b color="inherit" css={{ d: 'flex' }}>
                  Signed in as
                </Text>
                <Text b color="inherit" css={{ d: 'flex' }}>
                  {authData?.user?.email!}
                </Text>
              </Dropdown.Item>
              <Dropdown.Item key="settings" withDivider>
                Settings
              </Dropdown.Item>
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
        {collapseItems.map((item, index) => (
          <Navbar.CollapseItem
            key={item}
            activeColor="secondary"
            css={{
              color: index === collapseItems.length - 1 ? '$error' : '',
            }}
            isActive={index === 2}
          >
            <Link
              href="#"
              color="inherit"
              css={{
                minWidth: '100%',
              }}
            >
              {item}
            </Link>
          </Navbar.CollapseItem>
        ))}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Nav;
