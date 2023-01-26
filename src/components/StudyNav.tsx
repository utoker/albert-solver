import { faMoon, faPlus, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Avatar,
  Button,
  Dropdown,
  Image,
  Link,
  Navbar,
  Row,
  Text,
} from '@nextui-org/react';
import { type Assessment } from '@prisma/client';
import axios from 'axios';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { type FC, type Key } from 'react';
import AssessmentButton from './AssessmentButton';
import { useTheme as useNextTheme } from 'next-themes';
import { Switch, useTheme } from '@nextui-org/react';
import { mutate } from 'swr';

type Props = {
  assessments: Assessment[];
};

const StudyNav: FC<Props> = ({ assessments }) => {
  // NextAuth
  const { data: session } = useSession();

  // NextUI Theme
  const { setTheme } = useNextTheme();
  const { isDark } = useTheme();

  // Next Router
  const router = useRouter();

  // Handlers
  const handleNewAssessment = async () => {
    router.push('/study-room');
  };

  const handleChangeAssessment = (assessmentId: string) => {
    router.push(`/study-room/${assessmentId}`);
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    await axios.post('/api/assessment/delete', {
      assessmentId,
    });
    mutate('/api/assessment/get-all');
    if (router.query.assessmentId === assessmentId) router.push('/study-room');
  };

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

  return (
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
                // ml: '43px',
                fontSize: '$xs',
                color: '$secondary',
              }}
            >
              OPEN BETA
            </Text>
          </Text>
        </Link>
      </Navbar.Brand>
      <Navbar.Content enableCursorHighlight activeColor="secondary">
        <Navbar.Link href="/pricing">Pricing</Navbar.Link>
        <Navbar.Link isActive href="/study-room">
          Study Room
        </Navbar.Link>
      </Navbar.Content>
      <Navbar.Content>
        <Navbar.Item hideIn="xs">
          <Button
            flat
            auto
            onPress={() => setTheme(isDark ? 'light' : 'dark')}
            icon={<FontAwesomeIcon icon={isDark ? faSun : faMoon} />}
          />
        </Navbar.Item>
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
                  session?.user?.image ? session.user.image : '/user-avatar.png'
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
                {session?.user?.email}
              </Text>
            </Dropdown.Item>
            <Dropdown.Section
              title={` ${session?.user?.subscription.toUpperCase()} USER`}
            >
              {session?.user?.subscription === 'pro' ? (
                <Dropdown.Item key={'pro'}>Manage Subscription</Dropdown.Item>
              ) : (
                <Dropdown.Item key={'upgrade'}>Upgrade to Pro</Dropdown.Item>
              )}
            </Dropdown.Section>
            <Dropdown.Section>
              <Dropdown.Item key="dark" textValue="Dark Mode">
                <Row justify="space-between">
                  Dark Mode
                  <Switch
                    checked={isDark}
                    onChange={(e) =>
                      setTheme(e.target.checked ? 'dark' : 'light')
                    }
                  />
                </Row>
              </Dropdown.Item>
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

      <Navbar.Collapse css={{ bg: '$bg' }}>
        {router.route !== '/study-room' && (
          <Navbar.CollapseItem>
            <Button
              onPress={handleNewAssessment}
              ghost
              css={{ w: '220px' }}
              icon={<FontAwesomeIcon icon={faPlus} />}
            >
              New Assessment
            </Button>
          </Navbar.CollapseItem>
        )}
        {assessments &&
          assessments.map((assessment) => (
            <Navbar.CollapseItem key={assessment.id}>
              <AssessmentButton
                assessmentName={assessment.assessmentName}
                assessmentId={assessment.id}
                changeAssessment={(id) => handleChangeAssessment(id)}
                deleteAssessment={(id) => handleDeleteAssessment(id)}
              />
            </Navbar.CollapseItem>
          ))}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default StudyNav;
