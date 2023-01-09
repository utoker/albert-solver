import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Container,
  type FormElement,
  Grid,
  Input,
  Loading,
  Row,
  Spacer,
  Textarea,
} from '@nextui-org/react';
import axios from 'axios';
import { type GetServerSideProps, type NextPage } from 'next';
import { getSession, useSession } from 'next-auth/react';
import React, { type FC, useState, useCallback, useRef } from 'react';
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
import { useRouter } from 'next/router';

type PageProps = {
  assessmentsFromDB: string;
};

const StudyRoom: NextPage<PageProps> = ({ assessmentsFromDB }) => {
  const assessmentsParsed: Assessment[] = JSON.parse(assessmentsFromDB);
  const [assessments, setAssessments] = useState(assessmentsParsed);
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
    setAssessments((prev) =>
      prev.filter((assessment) => assessment.id !== assessmentId)
    );
    if (router.query.assessmentId === assessmentId) router.push('/study-room');
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
    console.log(formRef.current);
  }, [formRef]);

  return (
    <Container xl className={styles.App}>
      <Grid.Container>
        <Grid xs={0} sm={3} md={2}>
          <Container className={styles.sidemenu}>
            <div>
              <Button
                onPress={handleNewAssessment}
                ghost
                css={{ width: '100%' }}
                icon={<FontAwesomeIcon icon={faPlus} />}
              >
                New Assessment
              </Button>
              {assessments.map((assessment) => (
                <div key={assessment.id}>
                  <Spacer y={0.5} />
                  <AssessmentButton
                    assessmentName={assessment.assessmentName}
                    assessmentId={assessment.id}
                    changeAssessment={(id) => handleChangeAssessment(id)}
                    deleteAssessment={(id) => handleDeleteAssessment(id)}
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
          </Container>
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
    </Container>
  );
};

const AssessmentButton: FC<{
  changeAssessment: (id: string) => void;
  deleteAssessment: (id: string) => void;
  assessmentName: Assessment['assessmentName'];
  assessmentId: Assessment['id'];
}> = ({ changeAssessment, deleteAssessment, assessmentName, assessmentId }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [newAssessmentName, setNewAssessmentName] = useState(assessmentName);
  const changeAssessmentName = (e: React.ChangeEvent<FormElement>) => {
    if (e.target.value.length <= 19) {
      setNewAssessmentName(e.target.value);
    }
  };

  const handleDeleteAssessment = () => {
    if (isDeleteMode) {
      deleteAssessment(assessmentId);
    }
    setIsDeleteMode((prev) => !prev);
  };

  const handleEditAssessmentName = async () => {
    if (isEditMode) {
      await axios.post('/api/assessment-name', {
        assessmentName: newAssessmentName,
        assessmentId,
      });
    }
    setIsEditMode((prev) => !prev);
  };

  const onChangeAssessment = () => {
    setIsDeleteMode(false);
    changeAssessment(assessmentId);
  };
  return (
    <Button.Group
      ghost
      color="secondary"
      css={{ maxWidth: '220px', margin: '0' }}
    >
      <Button onPress={handleEditAssessmentName} css={{ padding: '8px' }}>
        <FontAwesomeIcon icon={isEditMode ? faCheck : faPen} />
      </Button>
      {isEditMode ? (
        <Input
          initialValue={newAssessmentName}
          onChange={(e) => changeAssessmentName(e)}
          autoFocus
          aria-label="edit"
          id="edit"
          underlined
          color="secondary"
          size="md"
          css={{
            h: '40px',
            border: '2px solid $primary',
            borderRadius: '0px',
            minWidth: '156px',
          }}
        />
      ) : (
        <Button onPress={onChangeAssessment} css={{ minWidth: '156px' }}>
          {newAssessmentName}
        </Button>
      )}
      <Button onPress={handleDeleteAssessment} css={{ padding: '8px' }}>
        <FontAwesomeIcon icon={isDeleteMode ? faCheck : faTrash} />
      </Button>
    </Button.Group>
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
