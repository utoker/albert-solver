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
} from '@nextui-org/react';
import axios from 'axios';
import { type GetServerSideProps, type NextPage } from 'next';
import { getSession, useSession } from 'next-auth/react';
import React, { useState, useCallback, useRef } from 'react';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { prisma } from '../../server/db/client';
import styles from './study-room.module.css';
import { type Assessment } from '@prisma/client';
import { useRouter } from 'next/router';
import SideMenu from '../../components/SideMenu';
import dynamic from 'next/dynamic';

// This is a workaround for hydration issues with Next.js
const StudyNav = dynamic(() => import('../../components/StudyNav'), {
  ssr: false,
});

type PageProps = {
  assessmentsFromDB: string;
};

const StudyRoom: NextPage<PageProps> = ({ assessmentsFromDB }) => {
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
  const [loading, setLoading] = useState(false);
  const { data: authSession } = useSession();
  const router = useRouter();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!input || loading) return;
    setLoading(true);
    const messages = [{ user: 'Student', message: input }];
    if (authSession?.user?.subscription === 'basic' && input.length > 400) {
      setLoading(false);
      return alert('Message too long! (max 400 characters)');
    }
    if (input.length < 8) {
      setLoading(false);
      return alert('Message too short! (min 8 characters)');
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
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      reset();
    }
  };

  const formRef = useRef<HTMLFormElement>(null);
  const onTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<FormElement>) => {
      if (e.keyCode === 13 && e.shiftKey === false) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    },
    [formRef]
  );
  const reset = useCallback(() => {
    // reset to the initial values by using form ref
    // or button type="reset" https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type
    formRef.current?.reset();
  }, [formRef]);

  return (
    <>
      <StudyNav
        assessments={assessments}
        chatLogs={chatLogs}
        setAssessments={(x) => setAssessments(x)}
        setChatLog={(x) => setChatLog(x)}
      />
      <Grid.Container css={{ height: 'calc(100vh - 76px)' }}>
        <Grid xs={0} sm={3} md={2}>
          <SideMenu
            assessments={assessments}
            chatLogs={chatLogs}
            setAssessments={(x) => setAssessments(x)}
            setChatLog={(x) => setChatLog(x)}
          />
        </Grid>
        <Grid xs={12} sm={9} md={10}>
          <Container className={styles.chatbox}>
            <div className={styles.chatLog}></div>
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
                    <Button auto ghost type="submit" id="submit">
                      {loading ? (
                        <Loading type="points" color="currentColor" size="sm" />
                      ) : (
                        <FontAwesomeIcon icon={faPaperPlane} />
                      )}
                    </Button>
                  </Row>
                )}
              </form>
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

    return {
      props: {
        assessmentsFromDB: JSON.stringify(assessments),
      },
    };
  }

  return {
    props: {},
  };
};
