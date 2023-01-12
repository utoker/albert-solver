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
} from '@nextui-org/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useCallback, useRef, useState, type FC } from 'react';
import styles from '../pages/study-room/study-room.module.css';
import ChatMessage from './ChatMessage';

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
};

const ChatBox: FC<ChatBoxProps> = ({
  assessmentId,
  chatLog,
  setChatLog,
  setChatLogs,
}) => {
  const { data: authSession } = useSession();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!input || loading) return;
    setLoading(true);
    const messages = [...chatLog, { user: 'Student', message: input }];
    if (authSession?.user?.subscription === 'basic' && input.length > 4000) {
      setLoading(false);
      return alert('Message too long! (max 400 characters)');
    }
    if (input.length < 8) {
      setLoading(false);
      return alert('Message too short! (min 8 characters)');
    }
    console.log('USERIDIDID', authSession?.user?.id);
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
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      reset();
    }
  };
  return (
    <Container className={styles.chatbox}>
      <div className={styles.chatLog}>
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
            <Row>
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
  );
};

export default ChatBox;
