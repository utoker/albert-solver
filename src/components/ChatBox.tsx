import { Container } from '@nextui-org/react';
import React, {
  type FC,
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import InputFrom from './InputForm';
import ChatMessage from './ChatMessage';
import ErrorModal from './ErrorModal';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import fetcher from '../utils/Fetcher';
import AppContext from './AppContext';

type chatLog = {
  user: string;
  message: string;
}[];
type chatLogs = {
  [key: string]: chatLog;
};

const ChatBox: FC = () => {
  const router = useRouter();
  const assessmentId = router.query.assessmentId as string;
  const [chatLog, setChatLog] = useState<chatLog>([]);
  const [errorMessage, setErrorMessage] = useState('');

  //
  const context = useContext(AppContext);

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
        context.setStream('');
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
  const scrollToBottomCallback = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottomCallback();
  }, [chatLog, scrollToBottomCallback]);

  return (
    <>
      <ErrorModal
        errorMessage={errorMessage}
        visible={visible}
        ModalCloseHandler={() => ModalCloseHandler()}
      />
      <Container
        css={{
          position: 'relative',
          mx: '$0',
          p: '0',
          '@xs': { mx: '$18', pl: '$12' },
        }}
      >
        <div
          ref={scrollRef}
          style={{
            overflow: 'auto', // scroll
            height: '75vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {chatLog &&
            chatLog.map((message, i) => (
              <ChatMessage message={message} key={i} />
            ))}
          {context.stream && (
            <>
              <ChatMessage
                message={{ user: 'Student', message: context.prompt }}
              />
              <ChatMessage message={{ user: 'AI', message: context.stream }} />
            </>
          )}
          <InputFrom
            scrollToBottomCallback={scrollToBottomCallback}
            // setPrompt={setPrompt}
            // setStreamResponse={setStreamResponse}
            chatLog={chatLog}
            assessmentId={assessmentId}
            modalHandler={modalHandler}
            mutateAssessments={mutateAssessments}
            setErrorMessage={setErrorMessage}
          />
        </div>
      </Container>
    </>
  );
};

export default ChatBox;
