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
  useContext,
} from 'react';
import { faMicrophone, faRecordVinyl } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import SideMenu from '../../components/SideMenu';
import dynamic from 'next/dynamic';
import ErrorModal from '../../components/ErrorModal';
import Examples from '../../components/Examples';
import useSWR from 'swr';
import Head from 'next/head';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import {
  basicInputLimit,
  basicDailyQuestionLimit,
  minInputLength,
  proInputLimit,
  proDailyQuestionLimit,
} from '../../utils/Constants';
import fetcher from '../../utils/Fetcher';
import Send from '../../components/Icons/Send';
import AppContext from '../../components/AppContext';
import sendRequest from '../../utils/SendRequest';

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

  const startListening = () => {
    // if (!listening) SpeechRecognition.startListening({ continuous: true }); // for continuous listening
    if (!listening) SpeechRecognition.startListening();
    if (listening) SpeechRecognition.stopListening();
  };

  if (!browserSupportsSpeechRecognition) {
    console.log("BROWSER DOESN'T SUPPORT SPEECH RECOGNITION");
  }
  useEffect(() => {
    setInput(transcript);
  }, [transcript]);

  // SWR for fetching assessments and message count
  const { data: assessments, mutate: mutateAssessments } = useSWR(
    '/api/assessment/get-all',
    fetcher
    // {
    //   onSuccess: (assessments) => {
    //     console.log('ONSUCCESS RUN INDEX');
    //     const chatLogsObject: chatLogs = {};
    //     assessments.forEach((assessment: { id: string; chatLog: string }) => {
    //       chatLogsObject[assessment.id] = JSON.parse(assessment.chatLog);
    //     });
    //     setChatLog(chatLogsObject[assessmentId] || []);
    //     setStreamResponse('');
    //   },
    // }
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

  //
  const context = useContext(AppContext);

  // Submit handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input || loading) return;
    setLoading(true);
    const messagesArr = [{ user: 'Student', message: input }];
    const prompt = messagesArr.map((message) => message.message).join('\n');
    if (subscription === 'basic' && input.length > basicInputLimit) {
      setLoading(false);
      setErrorMessage(`Message too long! (max ${basicInputLimit} characters)`);
      modalHandler();
      return;
    }
    if (subscription === 'pro' && input.length > proInputLimit) {
      setLoading(false);
      setErrorMessage(`Message too long! (max ${proInputLimit} characters)`);
      modalHandler();
      return;
    }
    if (subscription === 'basic' && count >= basicDailyQuestionLimit) {
      setLoading(false);
      setErrorMessage(
        `You have reached your daily question limit! (max ${basicDailyQuestionLimit} questions)`
      );
      modalHandler();
      return;
    }
    if (subscription === 'pro' && count >= proDailyQuestionLimit) {
      setLoading(false);
      setErrorMessage(
        `You have reached your daily question limit! (max ${proDailyQuestionLimit} questions)`
      );
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
      const newAssessment = await axios.post('/api/assessment/create', {
        assessmentName: input.slice(0, 18),
        chatLog: JSON.stringify([{ user: 'Student', message: input }]),
      });
      const assessmentId = newAssessment.data.newAssessment.id;
      router.push(`/study-room/${assessmentId}`);
      const response = await fetch('/api/openai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
        }),
      });
      console.log('Edge function returned.');
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      // This data is a ReadableStream
      const data = response.body;
      if (!data) {
        return;
      }
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = '';
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        context.setStream((prev) => prev + chunkValue);
        context.setPrompt(input);
        // scrollToBottomCallback();
        text += chunkValue;
      }

      const chatLogArr = [
        { user: 'Student', message: input },
        { user: 'AI', message: text },
      ];
      const url = '/api/assessment/chatLog/update';
      const arg = { chatLog: JSON.stringify(chatLogArr), assessmentId };
      mutateAssessments(sendRequest(url, { arg }));
      mutateCount();
      await fetch('/api/post-counter/increase-count');
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
              position: 'relative',
              mx: '$0',
              p: '0',
              '@xs': { mx: '$18', pl: '$12' },
            }}
          >
            <Examples examplePress={examplePress} />
            <Container
              css={{
                pb: '$8',
                px: '$6',
                position: 'absolute',
                bottom: '0',
                width: '100%',
                '@xs': {
                  pr: '$12',
                  pl: '$0',
                  pb: '$10',
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
                        <Send />
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
                        <FontAwesomeIcon
                          icon={faRecordVinyl}
                          color="#5C0523"
                          size="lg"
                          beatFade
                        />
                      ) : (
                        <FontAwesomeIcon icon={faMicrophone} size="lg" />
                      )}
                    </Button>
                  </Row>
                )}
                {subscription === 'basic' && (
                  <Text size="$sm" css={{ ta: 'center', pt: '$2' }}>
                    <Text hideIn="xs" span>
                      Basic users can only send {basicDailyQuestionLimit}{' '}
                      questions per day.{' '}
                    </Text>
                    <Text span>
                      Remaining questions today:{' '}
                      {basicDailyQuestionLimit - count}
                    </Text>
                  </Text>
                )}
              </form>
              <Spacer y={subscription === 'pro' ? 1.3 : 0} />
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
