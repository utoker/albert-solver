import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Container,
  Input,
  Loading,
  Row,
  Spacer,
  // Textarea,
  User,
} from '@nextui-org/react';
import axios from 'axios';
import { type GetServerSideProps, type NextPage } from 'next';
import { getSession, useSession } from 'next-auth/react';
import React, { type FC, useState } from 'react';
import {
  faCheck,
  faPaperPlane,
  faPen,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { prisma } from '../../server/db/client';
import styles from './study-room.module.css';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { type Assessment } from '@prisma/client';

type PageProps = {
  assessmentsFromDB: string;
};

const StudyRoom: NextPage<PageProps> = ({ assessmentsFromDB }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assessments: any = JSON.parse(assessmentsFromDB);
  const assessmentValue = () => {
    if (assessments[0]?.chatLog) return JSON.parse(assessments[0]?.chatLog);
    else return [];
  };
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState(assessmentValue());
  console.log('ASSESSMENT VALUE', assessmentValue());
  console.log('CHATLOG', chatLog);
  const { data: authSession } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const messages = [...chatLog, { user: 'Student', message: `${input}` }];
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
        messages: messages.map((message) => message.message).join('\n'),
      });
      const chatLogArray = [
        ...chatLog,
        { user: 'Student', message: input },
        { user: 'AI', message: res.data.result },
      ];
      const chatLogJson = JSON.stringify(chatLogArray);
      await axios.post('/api/chatlog', {
        chatLog: chatLogJson,
        assessmentId: assessments[0].id,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setChatLog((prev: any) => [
        ...prev,
        { user: 'Student', message: input },
        { user: 'AI', message: res.data.result },
      ]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setInput('');
    }
  };
  const handleNewAssessment = () => {
    // setAssessments((prev) => [...prev, [...chatLog]]);
    setChatLog([]);
    console.log('assessments', assessments);
  };
  const handleChangeAssessment = (i: number) => {
    console.log(i);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    // setChatLog(assessments[i]);
    // console.log('assessments[i]', assessments[i]);
  };
  // delete a assesment
  const handleDeleteAssessment = (i: number) => {
    console.log(i);
    // const newAssessments = assessments.filter((assessment, index) => {
    //   return index !== i;
    // });
    // setAssessments(newAssessments);
  };

  return (
    <Container xl className={styles.App}>
      {/* <div className={styles.App}> */}
      <aside className={styles.sidemenu}>
        <div>
          <Button
            disabled
            onPress={handleNewAssessment}
            ghost
            css={{ width: '100%' }}
            icon={<FontAwesomeIcon icon={faPlus} />}
          >
            New Assessment
          </Button>
          {assessments.map((_assessment: string[][], i: number) => (
            <div key={i}>
              <Spacer y={0.5} />
              <AssessmentButton
                assessments={assessments}
                i={i}
                changeAssessment={(i) => handleChangeAssessment(i)}
                deleteAssessment={(i) => handleDeleteAssessment(i)}
              />
            </div>
          ))}
        </div>
        <div className={styles.sidemenuBottom}>
          <Button
            light
            css={{ width: '100%' }}
            icon={<FontAwesomeIcon icon={faTrash} />}
          >
            Delete All Assessments
          </Button>
          <Button
            light
            css={{ width: '100%' }}
            icon={<FontAwesomeIcon icon={faDiscord} />}
          >
            HomeworkAI Discord
          </Button>
        </div>
      </aside>
      <section className={styles.chatbox}>
        <div className={styles.chatLog}>
          {chatLog &&
            chatLog.map((message, i) => (
              <ChatMessage message={message} key={i} />
            ))}
        </div>
        <div className={styles.chatInputHolder}>
          <form
            onSubmit={
              loading
                ? () => {
                    console.log(loading);
                  }
                : handleSubmit
            }
          >
            {authSession && (
              <Row>
                <Input
                  ref={focus}
                  // minRows={1}
                  // maxRows={5}
                  autoFocus
                  value={input}
                  tabIndex={0}
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
      </section>
      {/* </div> */}
    </Container>
  );
};

const AssessmentButton: FC<{
  i: number;
  changeAssessment: (i: number) => void;
  deleteAssessment: (i: number) => void;
  assessments: Assessment[];
}> = ({ i, changeAssessment, deleteAssessment, assessments }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const assessmentName = assessments[i]?.assessmentName;
  const [newAssessmentName, setNewAssessmentName] = useState(
    assessmentName || ''
  );
  const changeAssessmentName = (e: string) => {
    if (e.length <= 19) {
      setNewAssessmentName(e);
    }
  };
  const handleEditAssessmentName = async () => {
    if (isEditMode) {
      const res = await axios.post('/api/assessment-name', {
        assessmentName: newAssessmentName,
        assessmentId: assessments[i]?.id,
      });
      console.log('res', res);
    }
    setIsEditMode((prev) => !prev);
    console.log(isEditMode);
  };

  return (
    <Button.Group
      ghost
      color="secondary"
      css={{ maxWidth: '210px', margin: '0' }}
    >
      <Button onPress={handleEditAssessmentName} css={{ padding: '8px' }}>
        <FontAwesomeIcon icon={isEditMode ? faCheck : faPen} />
      </Button>
      {isEditMode ? (
        <Input
          value={newAssessmentName}
          onChange={(e) => changeAssessmentName(e.target.value)}
          autoFocus
          aria-label="edit"
          id="edit"
          underlined
          color="secondary"
          size="sm"
          css={{
            border: '2px solid $primary',
            borderRadius: '0px',
            minWidth: '156px',
          }}
        />
      ) : (
        <Button onPress={() => changeAssessment(i)} css={{ minWidth: '156px' }}>
          {newAssessmentName}
        </Button>
      )}
      <Button
        onPress={() => deleteAssessment(i)}
        css={{ padding: '8px' }}
        disabled
      >
        <FontAwesomeIcon icon={faTrash} />
      </Button>
    </Button.Group>
  );
};

type ChatMessageProps = {
  message: { user: string; message: string };
};
const ChatMessage: FC<ChatMessageProps> = ({ message }) => {
  const { data: AuthSession } = useSession();
  console.log('MASSAGE', message);
  return (
    <div
      className={
        message.user === 'AI' ? styles.chatMessageAI : styles.chatMessage
      }
    >
      <div className={styles.chatMessageCenter}>
        {message.user === 'AI' ? (
          <User squared src="./logo.png" name={undefined} />
        ) : (
          <User
            squared
            src={
              AuthSession?.user?.image ? AuthSession?.user?.image : './logo.png'
            }
            name={undefined}
          />
        )}
        <div className={styles.message}>{message.message}</div>
      </div>
    </div>
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
    console.log('ASESSMENTS', assessments);
    const jsonAsessments = JSON.stringify(assessments);
    return {
      props: { assessmentsFromDB: jsonAsessments },
    };
  }

  return {
    props: {},
  };
};
