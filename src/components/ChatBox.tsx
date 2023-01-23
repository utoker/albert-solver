/* eslint-disable @typescript-eslint/no-explicit-any */
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Container,
  type FormElement,
  Loading,
  Row,
  Spacer,
  Textarea,
  Text,
} from '@nextui-org/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, {
  type FormEvent,
  type KeyboardEvent,
  type FC,
  useCallback,
  useRef,
  useState,
  useEffect,
} from 'react';
import generate from '../helpers/generate';
import styles from '../pages/study-room/study-room.module.css';
import ChatMessage from './ChatMessage';
import ErrorModal from './ErrorModal';
import useSWR, { preload } from 'swr';
import sendRequest from '../helpers/sendRequest';
import { useRouter } from 'next/router';

type chatLog = {
  user: string;
  message: string;
}[];
type chatLogs = {
  [key: string]: chatLog;
};

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

preload('/api/assessment/get-all', fetcher);
preload('/api/post-counter/get-count', fetcher);

const ChatBox: FC = () => {
  const { data: authSession } = useSession();
  const [input, setInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const assessmentId = router.query.assessmentId as string;

  const onTextareaKeyDown = useCallback(
    (e: KeyboardEvent<FormElement>) => {
      if (e.keyCode === 13 && e.shiftKey === false && !loading) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    },
    [loading]
  );

  const [chatLog, setChatLog] = useState<chatLog>([]);

  const { data: messageCount, mutate: mutateCount } = useSWR(
    '/api/post-counter/get-count',
    fetcher
  );

  const { data: assessments, mutate } = useSWR(
    '/api/assessment/get-all',
    fetcher,
    {
      onSuccess: (assessments) => {
        console.log('ONSUCCESS RUN');
        const chatLogsObject: chatLogs = {};
        assessments.forEach((assessment: { id: string; chatLog: string }) => {
          chatLogsObject[assessment.id] = JSON.parse(assessment.chatLog);
        });
        setChatLog(chatLogsObject[assessmentId] || []);
      },
    }
  );

  useEffect(() => {
    if (assessments) {
      const chatLogsObject: chatLogs = {};
      assessments.forEach((assessment: { id: string; chatLog: string }) => {
        chatLogsObject[assessment.id] = JSON.parse(assessment.chatLog);
      });
      setChatLog(chatLogsObject[assessmentId] || []);
    }
  }, [assessmentId, assessments]);

  const reset = useCallback(() => {
    formRef.current?.reset();
  }, [formRef]);

  const subscription = authSession?.user?.subscription;
  const basicInputLimit = 500;
  const proInputLimit = 5000;

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
      const res = await generate(messages, messageCount, authSession);
      const chatLogArr = [
        ...chatLog,
        { user: 'Student', message: input },
        { user: 'AI', message: res },
      ];
      const url = '/api/assessment/chatLog/update';
      const arg = { chatLog: JSON.stringify(chatLogArr), assessmentId };
      mutate(sendRequest(url, { arg }));
      mutateCount();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const [visible, setVisible] = useState(false);
  const modalHandler = () => setVisible(true);
  const ModalCloseHandler = () => {
    setVisible(false);
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLog]);

  return (
    <>
      <ErrorModal
        errorMessage={errorMessage}
        visible={visible}
        ModalCloseHandler={() => ModalCloseHandler()}
      />
      <Container
        className={styles.chatbox}
        css={{ mx: '$0', p: '0', '@xs': { mx: '$18', pl: '$12' } }}
      >
        <div className={styles.chatLog} ref={scrollRef}>
          {chatLog &&
            chatLog.map((message, i) => (
              <ChatMessage message={message} key={i} />
            ))}
        </div>
        <div className={styles.chatInputHolder}>
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
                  onKeyDown={(e) => onTextareaKeyDown(e)}
                  minRows={1}
                  maxRows={5}
                  autoFocus
                  initialValue=""
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
                <Spacer x={1} />
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
              </Row>
            )}
          </form>
          {subscription === 'basic' && (
            <Text size="$sm" css={{ ta: 'center' }}>
              Basic users can only send 10 questions per day. Remaining
              questions today: {10 - messageCount.count}
            </Text>
          )}
          <Spacer y={subscription === 'pro' ? 1 : 0} />
        </div>
      </Container>
    </>
  );
};

export default ChatBox;
