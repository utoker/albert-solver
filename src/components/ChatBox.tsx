import { Container } from '@nextui-org/react';
import axios from 'axios';
import React, { type FC, useRef, useState, useEffect } from 'react';
import InputFrom from './InputForm';
import styles from '../pages/study-room/study-room.module.css';
import ChatMessage from './ChatMessage';
import ErrorModal from './ErrorModal';
import useSWR from 'swr';
import { useRouter } from 'next/router';

type chatLog = {
  user: string;
  message: string;
}[];
type chatLogs = {
  [key: string]: chatLog;
};

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const ChatBox: FC = () => {
  const [chatLog, setChatLog] = useState<chatLog>([]);
  const router = useRouter();
  const assessmentId = router.query.assessmentId as string;
  const [errorMessage, setErrorMessage] = useState('');

  const { data: assessments, mutate: mutateAssessments } = useSWR(
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
        css={{
          mx: '$0',
          p: '0',
          '@xs': { mx: '$18', pl: '$12' },
        }}
      >
        <div className={styles.chatLog} ref={scrollRef}>
          {chatLog &&
            chatLog.map((message, i) => (
              <ChatMessage message={message} key={i} />
            ))}
        </div>
        <InputFrom
          setChatLog={setChatLog}
          chatLog={chatLog}
          assessmentId={assessmentId}
          modalHandler={modalHandler}
          mutateAssessments={mutateAssessments}
          setErrorMessage={setErrorMessage}
        />
      </Container>
    </>
  );
};

export default ChatBox;
