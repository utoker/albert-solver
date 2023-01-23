import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Avatar,
  Button,
  Dropdown,
  Image,
  Link,
  Navbar,
  Text,
} from '@nextui-org/react';
import { type Assessment } from '@prisma/client';
import axios from 'axios';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { type FC, type Key } from 'react';
import AssessmentButton from './AssessmentButton';

type Props = {
  assessments: Assessment[];
};

const StudyNav: FC<Props> = ({ assessments }) => {
  const { data: authData } = useSession();

  const router = useRouter();
  const handleNewAssessment = async () => {
    router.push('/study-room');
  };

  const handleChangeAssessment = (assessmentId: string) => {
    router.push(`/study-room/${assessmentId}`);
  };
  const handleDeleteAssessment = async (assessmentId: string) => {
    await axios.post('/api/assessment-delete', {
      assessmentId,
    });
    //mutate
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
        router.push('/api/create-portal-session');
        break;
      case 'upgrade':
        router.push('/pricing');
        break;
    }
  };

  // const collapseItems = ['Help & Feedback', 'Log Out'];

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
        <Link href="/" color="inherit">
          <Image src="/logoAA.png" alt="Logo" height={36} width={36} />
          <Text b color="inherit" hideIn="xs">
            Albert Solver
            <Text
              css={{
                marginTop: '-36px',
                fontSize: '$xs',
                marginLeft: '43px',
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
                src={
                  authData?.user?.image
                    ? authData.user.image
                    : '../userLogo.png'
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
                <Dropdown.Item key={'pro'}>Manage Subscription</Dropdown.Item>
              ) : (
                <Dropdown.Item key={'upgrade'}>Upgrade to Pro</Dropdown.Item>
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

      <Navbar.Collapse transitionDelay={300}>
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
