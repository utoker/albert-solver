import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Container,
  type FormElement,
  Grid,
  Loading,
  Row,
  Spacer,
  Textarea,
  Text,
} from '@nextui-org/react';
import axios from 'axios';
import { type GetServerSideProps, type NextPage } from 'next';
import { getSession, useSession } from 'next-auth/react';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { prisma } from '../../server/db/client';
import styles from './study-room.module.css';
import { type Assessment } from '@prisma/client';
import { useRouter } from 'next/router';
import SideMenu from '../../components/SideMenu';
import dynamic from 'next/dynamic';
import ErrorModal from '../../components/ErrorModal';
import Examples from '../../components/Examples';

// This is a workaround for hydration issues with Next.js
const StudyNav = dynamic(() => import('../../components/StudyNav'), {
  ssr: false,
});

type PageProps = {
  assessmentsFromDB: string;
  messageCountFromDB: number;
};

const StudyRoom: NextPage<PageProps> = ({
  assessmentsFromDB,
  messageCountFromDB,
}) => {
  type chatLog = {
    user: string;
    message: string;
  }[];
  type chatLogsObject = {
    [key: string]: chatLog;
  };
  const assessmentsParsed: Assessment[] = JSON.parse(assessmentsFromDB);
  const [assessments, setAssessments] = useState(assessmentsParsed);
  const logs = useCallback(() => {
    const chatLogsObject: chatLogsObject = {};
    assessments.forEach((assessment) => {
      chatLogsObject[assessment.id] = JSON.parse(assessment.chatLog);
    });
    return chatLogsObject;
  }, [assessments]);
  const [chatLogs] = useState(logs());
  const [chatLog, setChatLog] = useState([] as chatLog);
  const [input, setInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(messageCountFromDB);
  const { data: authSession } = useSession();
  const router = useRouter();
  const subscription = authSession?.user?.subscription;
  const basicInputLimit = 500;
  const proInputLimit = 5000;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const reset = useCallback(() => {
    // reset to the initial values by using form ref
    // or button type="reset" https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type
    formRef.current?.reset();
  }, [formRef]);
  const handleSubmit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (e: any) => {
      e.preventDefault();
      if (!input || loading) return;
      setLoading(true);
      const messages = [{ user: 'Student', message: input }];
      if (subscription === 'basic' && input.length > basicInputLimit) {
        setLoading(false);
        setErrorMessage('Message too long! (max 500 characters)');
        modalHandler();
        return;
      }
      if (subscription === 'pro' && input.length > proInputLimit) {
        setLoading(false);
        setErrorMessage('Message too long! (max 5000 characters)');
        modalHandler();
        return;
      }
      if (input.length < 8) {
        setLoading(false);
        setErrorMessage('Message too short! (min 8 characters)');
        modalHandler();
        return;
      }
      try {
        const res = await axios.post('/api/generate', {
          userId: authSession?.user?.id,
          messages: messages.map((message) => message.message).join('\n'),
        });
        const newAssres = await axios.post('/api/assessment-create', {
          // first 18 characters of the question
          assessmentName: input.slice(0, 18),
          chatLog: JSON.stringify([
            { user: 'Student', message: input },
            { user: 'AI', message: res.data.result },
          ]),
        });
        setAssessments((prev) => [...prev, newAssres.data.newAssessment]);
        router.push(`/study-room/${newAssres.data.newAssessment.id}`);
        setMessageCount((prev) => prev++);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        reset();
      }
    },
    [input, loading, subscription, authSession, router, reset]
  );

  const onTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<FormElement>) => {
      if (e.keyCode === 13 && e.shiftKey === false) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    },
    [formRef]
  );

  const [visible, setVisible] = useState(false);
  const modalHandler = () => setVisible(true);
  const ModalCloseHandler = () => setVisible(false);
  const [exampleClicked, setExampleClicked] = useState(false);
  useEffect(() => {
    if (inputRef.current !== null && exampleClicked) {
      setExampleClicked(false);
      inputRef.current.value = input;
      handleSubmit(new Event('submit'));
    }
  }, [exampleClicked, handleSubmit, input]);

  const examplePress = (input: React.SetStateAction<string>) => {
    setExampleClicked(true);
    setInput(input);
  };
  return (
    <>
      <StudyNav
        assessments={assessments}
        chatLogs={chatLogs}
        setAssessments={(x) => setAssessments(x)}
        setChatLog={(x) => setChatLog(x)}
      />
      <ErrorModal
        errorMessage={errorMessage}
        ModalCloseHandler={() => ModalCloseHandler()}
        visible={visible}
      />
      <Grid.Container css={{ height: 'calc(100vh - 76px)' }}>
        <Grid xs={0} sm={2} md={1.5}>
          <SideMenu
            assessments={assessments}
            chatLogs={chatLogs}
            setAssessments={(x) => setAssessments(x)}
            setChatLog={(x) => setChatLog(x)}
          />
        </Grid>
        <Grid xs={12} sm={10} md={10.5}>
          <Container className={styles.chatbox}>
            <div className={styles.chatLog}>
              <Examples examplePress={examplePress} />
            </div>
            <div className={styles.chatInputHolder}>
              <form
                ref={formRef}
                onSubmit={
                  loading
                    ? () => {
                        console.log(loading);
                      }
                    : (e) => handleSubmit(e)
                }
              >
                {authSession && (
                  <Row>
                    <Textarea
                      css={{ ml: '$18' }}
                      ref={inputRef}
                      onKeyDown={(event) => onTextareaKeyDown(event)}
                      initialValue=""
                      minRows={1}
                      maxRows={5}
                      autoFocus
                      onChange={(e) => setInput(e.target.value)}
                      aria-label="question"
                      id="question"
                      fullWidth
                    />
                    <Spacer x={0.5} />
                    <Button
                      auto
                      ghost
                      type="submit"
                      id="submit"
                      css={{ h: '37px' }}
                    >
                      {loading ? (
                        <Loading type="points" color="currentColor" size="sm" />
                      ) : (
                        <FontAwesomeIcon icon={faPaperPlane} />
                      )}
                    </Button>
                  </Row>
                )}
              </form>
              {subscription === 'basic' && (
                <Text size="$sm" css={{ ta: 'center' }}>
                  Basic users can only send 10 questions per day. Remaining
                  questions today: {10 - messageCount}
                </Text>
              )}
              <Spacer y={subscription === 'pro' ? 1 : 0} />
            </div>
          </Container>
        </Grid>
      </Grid.Container>
    </>
  );
};

export default StudyRoom;

//ssr
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
        callback: '/study-room',
      },
    };
  }
  if (session.user?.id) {
    const assessments: Assessment[] = await prisma.assessment.findMany({
      where: {
        userId: session.user.id,
      },
    });
    const messageCount = await prisma.postCounter.findUnique({
      where: {
        userId: session.user.id,
      },
    });
    if (!messageCount) {
      await prisma.postCounter.create({
        data: {
          userId: session.user.id,
          count: 0,
        },
      });
    }
    return {
      props: {
        assessmentsFromDB: JSON.stringify(assessments),
        messageCountFromDB: messageCount?.count,
      },
    };
  }

  return {
    props: {},
  };
};
