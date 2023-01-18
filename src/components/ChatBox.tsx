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
import React, { useCallback, useRef, useState, type FC } from 'react';
import styles from '../pages/study-room/study-room.module.css';
import ChatMessage from './ChatMessage';
import ErrorModal from './ErrorModal';

type chatLog = {
  user: string;
  message: string;
}[];
type chatLogsObject = {
  [key: string]: chatLog;
};
type ChatBoxProps = {
  assessmentId: string;
  chatLog: chatLog;
  setChatLog: React.Dispatch<React.SetStateAction<chatLog>>;
  setChatLogs: React.Dispatch<React.SetStateAction<chatLogsObject>>;
  messageCount: number;
};

const ChatBox: FC<ChatBoxProps> = ({
  assessmentId,
  chatLog,
  setChatLog,
  setChatLogs,
  messageCount: messageCountFromDB,
}) => {
  const { data: authSession } = useSession();
  const [input, setInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(messageCountFromDB);
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
    formRef.current?.reset();
  }, [formRef]);
  const subscription = authSession?.user?.subscription;
  const basicInputLimit = 500;
  const proInputLimit = 5000;
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!input || loading) return;
    setLoading(true);
    const messages = [...chatLog, { user: 'Student', message: input }];
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
    if (input.length < 8) {
      setLoading(false);
      setErrorMessage('Message too short! (min 8 characters)');
      modalHandler();
      return;
    }
    try {
      const res = await axios.post('/api/generate', {
        userId: authSession?.user?.id,
        messages: messages.map((message) => message.message).join('\n'),
      });
      const chatLogArray = [
        ...chatLog,
        { user: 'Student', message: input },
        { user: 'AI', message: res.data.result },
      ];
      setChatLogs((prev) => ({
        ...prev,
        [assessmentId]: chatLogArray,
      }));
      await axios.post('/api/chatlog', {
        chatLog: JSON.stringify(chatLogArray),
        assessmentId,
      });
      setChatLog((prev) => [
        ...prev,
        { user: 'Student', message: input },
        { user: 'AI', message: res.data.result },
      ]);
      setMessageCount((prev) => prev + 1);
      reset();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const [visible, setVisible] = React.useState(false);
  const modalHandler = () => setVisible(true);
  const ModalCloseHandler = () => {
    setVisible(false);
    console.log('closed');
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messageCount]);

  return (
    <>
      <ErrorModal
        errorMessage={errorMessage}
        visible={visible}
        ModalCloseHandler={() => ModalCloseHandler()}
      />
      <Container className={styles.chatbox}>
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
          {subscription === 'basic' && (
            <Text size="$sm" css={{ ta: 'center' }}>
              Basic users can only send 10 messages per day. Remaining messages
              today: {10 - messageCount}
            </Text>
          )}
          <Spacer y={subscription === 'pro' ? 1 : 0} />
        </div>
      </Container>
    </>
  );
};

export default ChatBox;
