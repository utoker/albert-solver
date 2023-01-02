import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input, Spacer, User } from '@nextui-org/react';
import axios from 'axios';
import { type GetServerSideProps, type NextPage } from 'next';
import { getSession, useSession } from 'next-auth/react';
import React, { type FC, useState } from 'react';
import {
  faCheck,
  faPen,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { prisma } from '../../server/db/client';
import styles from './study-room.module.css';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

type PageProps = {
  assessments: string[][];
};

const StudyRoom: NextPage<PageProps> = ({ assessments: assessmentsFromDB }) => {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState([
    { user: 'AI', message: 'Hello, I am AI. How can I help you?' },
  ]);
  const [assessments, setAssessments] = useState([chatLog]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setChatLog((prev) => [...prev, { user: 'Student', message: input }]);
    const messages = [...chatLog, { user: 'Student', message: `${input}` }];
    try {
      const res = await axios.post('/api/generate', {
        messages: messages.map((message) => message.message).join('\n'),
      });
      setChatLog([...messages, { user: 'AI', message: res.data.result }]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setInput('');
    }
  };
  const handleNewAssessment = () => {
    setAssessments((prev) => [...prev, [...chatLog]]);
    setChatLog([]);
    console.log('assessments', assessments);
  };
  const handleChangeAssessment = (i: number) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    setChatLog(assessments[i]!);
  };
  // delete a assesment
  const handleDeleteAssessment = (i: number) => {
    const newAssessments = assessments.filter((assessment, index) => {
      return index !== i;
    });
    setAssessments(newAssessments);
  };
  const { data: AuthSession } = useSession();

  return (
    <div className={styles.App}>
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
          {assessments.map((assessment, i) => (
            <div key={i}>
              <Spacer y={0.5} />
              <AssessmentButton
                assessments={assessmentsFromDB}
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
          {chatLog.map((message, i) => (
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
            {AuthSession && (
              <Input
                autoFocus
                value={input}
                tabIndex={0}
                onChange={(e) => setInput(e.target.value)}
                aria-label="question"
                id="question"
                fullWidth
              />
            )}
          </form>
        </div>
      </section>
    </div>
  );
};

const AssessmentButton: FC<{
  i: number;
  changeAssessment: (i: number) => void;
  deleteAssessment: (i: number) => void;
  assessments: string[][];
}> = ({ i, changeAssessment, deleteAssessment, assessments }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [assessmentName, setAssessmentName] = useState('');
  const changeAssessmentName = async (e: string) => {
    if (e.length <= 19) {
      setAssessmentName(e);
      // axios post to update assessment name url /api/assessment-name with assessmentName in body
      // const res = await axios.post('/api/assessment-name', {
      //   assessmentName: assessmentName,
      //   assessmentId: assessments[i].id,
      // });
      console.log('assessments', JSON.parse(assessments));
    }
  };

  return (
    <Button.Group ghost css={{ maxWidth: '210px', margin: '0' }}>
      <Button
        onPress={() => setIsEditMode((prev) => !prev)}
        css={{ padding: '8px' }}
      >
        <FontAwesomeIcon icon={isEditMode ? faCheck : faPen} />
      </Button>
      {isEditMode ? (
        <Input
          value={assessmentName}
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
          {assessmentName || `Assessment ${i + 1}`}
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
      },
    };
  }
  if (session.user?.id) {
    const assessments = await prisma.assessment.findMany({
      where: {
        userId: session.user.id,
      },
    });

    if (assessments.length === 0) {
      await prisma.assessment.create({
        data: {
          userId: session.user.id,
          assessmentName: 'Assessment 1',
        },
      });
    }
    // console.log('ASSESSMENTS', assessments);
    const Jsn = JSON.stringify(assessments);
    // console.log('JsnJsnJsnJsn', Jsn);
    return {
      props: { session, assessments: Jsn },
    };
  }

  return {
    props: { session },
  };
};
