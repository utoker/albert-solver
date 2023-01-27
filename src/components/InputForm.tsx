import { faMicrophone, faRecordVinyl } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useSWR, { type KeyedMutator } from 'swr';
import {
  Button,
  Container,
  type FormElement,
  Loading,
  Row,
  Spacer,
  Text,
  Textarea,
} from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import React, {
  type KeyboardEvent,
  useCallback,
  useRef,
  type FC,
  type FormEvent,
  useState,
  useEffect,
} from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import axios from 'axios';
import sendRequest from '../helpers/sendRequest';
import generate from '../helpers/generate';
import {
  basicInputLimit,
  basicDailyQuestionLimit,
  minInputLength,
  proInputLimit,
} from '../helpers/constants';
import Send from './Icons/Send';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

type chatLog = {
  user: string;
  message: string;
}[];

type Props = {
  chatLog: chatLog;
  setChatLog: React.Dispatch<React.SetStateAction<chatLog>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  modalHandler: () => void;
  mutateAssessments: KeyedMutator<chatLog>;
  assessmentId: string;
};

const InputForm: FC<Props> = ({
  chatLog,
  setChatLog,
  setErrorMessage,
  modalHandler,
  mutateAssessments,
  assessmentId,
}) => {
  // SWR for fetching message count
  const { data: messageCount, mutate: mutateCount } = useSWR(
    '/api/post-counter/get-count',
    fetcher
  );
  const count = messageCount?.count;

  // Next Auth
  const { data: session } = useSession();
  const subscription = session?.user?.subscription;

  // Refs
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // States
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');

  // Speech Recognition
  const { transcript, listening, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  const startListening = () => SpeechRecognition.startListening();
  if (!browserSupportsSpeechRecognition) {
    console.log("BROWSER DOESN'T SUPPORT SPEECH RECOGNITION");
  }
  useEffect(() => {
    if (inputRef.current !== null) {
      inputRef.current.value = transcript;
    }
  }, [transcript]);

  useEffect(() => {
    setInput(transcript);
  }, [transcript]);

  // Handlers
  const onTextareaKeyDown = useCallback(
    (e: KeyboardEvent<FormElement>) => {
      if (e.keyCode === 13 && e.shiftKey === false && !loading) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    },
    [loading]
  );

  const reset = useCallback(() => {
    formRef.current?.reset();
  }, [formRef]);

  // Submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input || loading) return;
    setLoading(true);
    const messagesArr = [...chatLog, { user: 'Student', message: input }];
    const messages = messagesArr.map((message) => message.message).join('\n');
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
    if (input.length < minInputLength) {
      setLoading(false);
      setErrorMessage(`Message too short! (min ${minInputLength} characters)`);
      modalHandler();
      return;
    }
    try {
      reset();
      setChatLog((prev) => [
        ...prev,
        { user: 'Student', message: input },
        { user: 'AI', message: 'Thinking...' },
      ]);
      const res = await generate(messages, count, session);
      const chatLogArr = [
        ...chatLog,
        { user: 'Student', message: input },
        { user: 'AI', message: res },
      ];
      const url = '/api/assessment/chatLog/update';
      const arg = { chatLog: JSON.stringify(chatLogArr), assessmentId };
      mutateAssessments(sendRequest(url, { arg }));
      mutateCount();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <Row align="center">
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
              Basic users can only send {basicDailyQuestionLimit} questions per
              day.{' '}
            </Text>
            <Text span>
              Remaining questions today: {basicDailyQuestionLimit - count}
            </Text>
          </Text>
        )}
      </form>
      <Spacer y={subscription === 'pro' ? 1 : 0} />
    </Container>
  );
};

export default InputForm;
