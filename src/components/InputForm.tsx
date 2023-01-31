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
  useContext,
} from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import sendRequest from '../utils/SendRequest';
// import generate from '../utils/Generate';
import {
  basicInputLimit,
  basicDailyQuestionLimit,
  minInputLength,
  proInputLimit,
  proDailyQuestionLimit,
} from '../utils/Constants';
import Send from './Icons/Send';
import AppContext from './AppContext';
import fetcher from '../utils/Fetcher';

type chatLog = {
  user: string;
  message: string;
}[];

type Props = {
  chatLog: chatLog;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  // setStreamResponse: React.Dispatch<React.SetStateAction<string>>;
  modalHandler: () => void;
  mutateAssessments: KeyedMutator<chatLog>;
  assessmentId: string;
  // setPrompt: React.Dispatch<React.SetStateAction<string>>;
  scrollToBottomCallback: () => void;
};

const InputForm: FC<Props> = ({
  // setStreamResponse,
  // setPrompt,
  chatLog,
  setErrorMessage,
  modalHandler,
  mutateAssessments,
  assessmentId,
  scrollToBottomCallback,
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
  const startListening = () => {
    // if (!listening) SpeechRecognition.startListening({ continuous: true }); // for continuous listening
    if (!listening) SpeechRecognition.startListening();
    if (listening) SpeechRecognition.stopListening();
  };
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

  //
  const context = useContext(AppContext);

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

  // Submit handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input || loading) return;
    setLoading(true);
    const messagesArr = [...chatLog, { user: 'Student', message: input }];
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
      reset();
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
        scrollToBottomCallback();
        text += chunkValue;
      }
      const chatLogArr = [
        ...chatLog,
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
    }
  };

  return (
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
                <FontAwesomeIcon
                  color="#5C0523"
                  icon={faRecordVinyl}
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
          <Text
            size="$sm"
            css={{
              ta: 'center',
              pt: '$2',
            }}
          >
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
      <Spacer y={subscription === 'pro' ? 1.3 : 0} />
    </Container>
  );
};

export default InputForm;
