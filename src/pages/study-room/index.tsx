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
import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  type FormEvent,
} from 'react';
import {
  faMicrophone,
  faPaperPlane,
  faRecordVinyl,
} from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import SideMenu from '../../components/SideMenu';
import dynamic from 'next/dynamic';
import ErrorModal from '../../components/ErrorModal';
import Examples from '../../components/Examples';
import useSWR from 'swr';
import generate from '../../helpers/generate';
import Head from 'next/head';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import {
  basicInputLimit,
  dailyQuestionLimit,
  minInputLength,
  proInputLimit,
} from '../../helpers/constants';
import fetcher from '../../helpers/fetcher';

// This is a workaround for hydration issues with Next.js
const StudyNav = dynamic(() => import('../../components/StudyNav'), {
  ssr: false,
});

const StudyRoom: NextPage = () => {
  // Next Auth
  const { data: session } = useSession();
  const subscription = session?.user?.subscription;

  // Next Router
  const router = useRouter();

  // Speech Recognition
  const { transcript, listening, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  const startListening = () => SpeechRecognition.startListening();
  if (!browserSupportsSpeechRecognition) {
    console.log("BROWSER DOESN'T SUPPORT SPEECH RECOGNITION");
  }
  useEffect(() => {
    setInput(transcript);
  }, [transcript]);

  // SWR for fetching assessments and message count
  const { data: assessments, mutate } = useSWR(
    '/api/assessment/get-all',
    fetcher
  );
  const { data: messageCount, mutate: mutateCount } = useSWR(
    '/api/post-counter/get-count',
    fetcher
  );
  const count = messageCount?.count;

  // States
  const [input, setInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Handlers
  const reset = useCallback(() => {
    formRef.current?.reset();
  }, [formRef]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input || loading) return;
    setLoading(true);
    const messagesArr = [{ user: 'Student', message: input }];
    const messages = messagesArr.map((message) => message.message).join('\n');
    if (subscription === 'basic' && input.length > basicInputLimit) {
      setLoading(false);
      setErrorMessage('Message too long! (max {basicInputLimit} characters)');
      modalHandler();
      return;
    }
    if (subscription === 'pro' && input.length > proInputLimit) {
      setLoading(false);
      setErrorMessage(`Message too long! (max ${proInputLimit} characters)`);
      modalHandler();
      return;
    }
    if (input.length < minInputLength) {
      setLoading(false);
      setErrorMessage(`Message too short! (min ${minInputLength} characters)`);
      modalHandler();
      return;
    }
    try {
      const res = await generate(messages, count, session);
      const chatLog = JSON.stringify([
        { user: 'Student', message: input },
        { user: 'AI', message: res },
      ]);
      const newAssessment = await axios.post('/api/assessment/create', {
        assessmentName: input.slice(0, 18),
        chatLog,
      });
      mutate();
      mutateCount();
      router.push(`/study-room/${newAssessment.data.newAssessment.id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      reset();
    }
  };

  const onTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<FormElement>) => {
      if (e.keyCode === 13 && e.shiftKey === false && !loading) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    },
    [loading]
  );

  const [visible, setVisible] = useState(false);
  const modalHandler = () => setVisible(true);
  const ModalCloseHandler = () => setVisible(false);
  const [exampleClicked, setExampleClicked] = useState(false);

  useEffect(() => {
    if (inputRef.current !== null && exampleClicked) {
      setExampleClicked(false);
      inputRef.current.value = input;
    }
  }, [exampleClicked, input]);

  useEffect(() => {
    if (inputRef.current !== null) {
      inputRef.current.value = transcript;
    }
  }, [transcript]);

  const examplePress = (input: React.SetStateAction<string>) => {
    setExampleClicked(true);
    setInput(input);
  };

  return (
    <>
      <Head>
        <link
          rel="preload"
          href="/api/assessment/get-all"
          as="fetch"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/api/post-counter/get-count"
          as="fetch"
          crossOrigin="anonymous"
        />
      </Head>
      <StudyNav assessments={assessments || []} />
      <ErrorModal
        errorMessage={errorMessage}
        ModalCloseHandler={() => ModalCloseHandler()}
        visible={visible}
      />
      <Grid.Container css={{ height: 'calc(100vh - 76px)' }}>
        <Grid xs={0} sm={2} md={1.5}>
          <SideMenu assessments={assessments || []} />
        </Grid>
        <Grid xs={12} sm={10} md={10.5}>
          <Container
            css={{
              flex: '1', //
              position: 'relative',
              mx: '$0',
              p: '0',
              '@xs': { mx: '$18', pl: '$12' },
            }}
          >
            <Examples examplePress={examplePress} />
            <Container
              css={{
                pb: '$2',
                pl: '$0',
                pr: '$2',
                position: 'absolute',
                bottom: '0',
                width: '100%',
                '@xs': {
                  pb: '$8',
                  pr: '$12',
                },
              }}
            >
              <form
                ref={formRef}
                onSubmit={
                  loading
                    ? () => {
                        console.log(loading);
                      }
                    : handleSubmit
                }
              >
                {session && (
                  <Row>
                    <Textarea
                      ref={inputRef}
                      onKeyDown={(e) => onTextareaKeyDown(e)}
                      initialValue=""
                      minRows={1}
                      maxRows={5}
                      autoFocus
                      onChange={(e) => setInput(e.target.value)}
                      aria-label="question"
                      id="question"
                      fullWidth
                    />
                    {subscription === 'basic'
                      ? input.length > basicInputLimit - 100 && (
                          <Text
                            size="$sm"
                            color="error"
                            css={{
                              position: 'absolute',
                              bottom: '0',
                              right: '$20',
                            }}
                          >
                            {basicInputLimit}/{input.length}
                          </Text>
                        )
                      : input.length > proInputLimit - 200 && (
                          <Text
                            size="$sm"
                            color="error"
                            css={{
                              position: 'absolute',
                              bottom: '0',
                              right: '$20',
                            }}
                          >
                            {proInputLimit}/{input.length}
                          </Text>
                        )}
                    <Spacer x={0.5} />
                    <Button
                      css={{ h: '37px' }}
                      auto
                      ghost
                      type="submit"
                      id="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loading type="points" color="currentColor" size="sm" />
                      ) : (
                        <FontAwesomeIcon icon={faPaperPlane} />
                      )}
                    </Button>
                    <Spacer x={0.5} />
                    <Button
                      css={{ h: '37px' }}
                      auto
                      ghost
                      id="microphone"
                      disabled={loading}
                      onPress={startListening}
                    >
                      {listening ? (
                        <FontAwesomeIcon icon={faRecordVinyl} />
                      ) : (
                        <FontAwesomeIcon icon={faMicrophone} />
                      )}
                    </Button>
                  </Row>
                )}
                {subscription === 'basic' && (
                  <Text size="$sm" css={{ ta: 'center' }}>
                    <Text hideIn="xs" span>
                      Basic users can only send {dailyQuestionLimit} questions
                      per day.{' '}
                    </Text>
                    <Text span>
                      Remaining questions today: {dailyQuestionLimit - count}
                    </Text>
                  </Text>
                )}
              </form>
              <Spacer y={subscription === 'pro' ? 1 : 0} />
            </Container>
          </Container>
        </Grid>
      </Grid.Container>
    </>
  );
};

export default StudyRoom;

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
  return {
    props: {},
  };
};
