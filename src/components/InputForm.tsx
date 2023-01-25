import {
  faMicrophone,
  faPaperPlane,
  faRecordVinyl,
} from '@fortawesome/free-solid-svg-icons';
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
  dailyQuestionLimit,
  proInputLimit,
} from '../helpers/constants';

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
  //

  //swr
  const { data: messageCount, mutate: mutateCount } = useSWR(
    '/api/post-counter/get-count',
    fetcher
  );
  const count = messageCount?.count;

  //session
  const { data: authSession } = useSession();
  const subscription = authSession?.user?.subscription;

  //refs
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  //states
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');

  //callbacks
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

  // voice recognition
  const {
    transcript,
    listening,
    // resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
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

  //submit handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input || loading) return;
    setLoading(true);
    const messagesArr = [...chatLog, { user: 'Student', message: input }];
    const messages = messagesArr.map((message) => message.message).join('\n');
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
    if (input.length < 3) {
      setLoading(false);
      setErrorMessage('Message too short! (min 3 characters)');
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
      const res = await generate(messages, count, authSession);
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
        position: 'absolute',
        bottom: '0',
        width: '100%',
        pb: '$8',
        pl: '$0',
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
        {authSession && (
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
            Basic users can only send {dailyQuestionLimit} questions per day.
            Remaining questions today: {dailyQuestionLimit - count}
          </Text>
        )}
      </form>
      <Spacer y={subscription === 'pro' ? 1 : 0} />
    </Container>
  );
};

export default InputForm;
