import { Grid } from '@nextui-org/react';
import { type GetServerSideProps, type NextPage } from 'next';
import { getSession } from 'next-auth/react';
import React, { useCallback, useState } from 'react';
import { prisma } from '../../server/db/client';
import { type Assessment } from '@prisma/client';
import SideMenu from '../../components/SideMenu';
import ChatBox from '../../components/ChatBox';
import dynamic from 'next/dynamic';

// This is a workaround for hydration issues with Next.js
const StudyNav = dynamic(() => import('../../components/StudyNav'), {
  ssr: false,
});

type PageProps = {
  assessmentsFromDB: string;
  assessmentId: string;
  messageCountFromDB: number;
};

const StudyRoom: NextPage<PageProps> = ({
  assessmentId,
  assessmentsFromDB,
  messageCountFromDB,
}) => {
  type chatLog = {
    user: string;
    message: string;
  }[];
  type chatLogsObject = {
    [key: string]: chatLog;
  };
  const assessmentsParsed: Assessment[] = JSON.parse(assessmentsFromDB);
  const [assessments, setAssessments] = useState(assessmentsParsed);
  const logs = useCallback(() => {
    const chatLogsObject: chatLogsObject = {};
    assessments.forEach((assessment) => {
      chatLogsObject[assessment.id] = JSON.parse(assessment.chatLog);
    });
    return chatLogsObject;
  }, [assessments]);

  const [chatLogs, setChatLogs] = useState(logs());
  const [chatLog, setChatLog] = useState(chatLogs[assessmentId] || []);

  return (
    <>
      <StudyNav
        assessments={assessments}
        chatLogs={chatLogs}
        setAssessments={(x) => setAssessments(x)}
        setChatLog={(x) => setChatLog(x)}
      />
      <Grid.Container css={{ height: 'calc(100vh - 76px)' }}>
        <Grid xs={0} sm={2} md={1.5}>
          <SideMenu
            assessments={assessments}
            chatLogs={chatLogs}
            setAssessments={(x) => setAssessments(x)}
            setChatLog={(x) => setChatLog(x)}
          />
        </Grid>
        <Grid xs={12} sm={10} md={10.5}>
          <ChatBox
            messageCount={messageCountFromDB}
            assessmentId={assessmentId}
            chatLog={chatLog}
            setChatLog={(x) => setChatLog(x)}
            setChatLogs={(x) => setChatLogs(x)}
          />
        </Grid>
      </Grid.Container>
    </>
  );
};

export default StudyRoom;

//ssr
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { assessmentId } = context.query;

  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
        callback: '/study-room',
      },
    };
  }
  if (session.user?.id) {
    const assessments: Assessment[] = await prisma.assessment.findMany({
      where: {
        userId: session.user.id,
      },
    });
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: assessmentId as string,
      },
    });
    if (!assessment) {
      return {
        redirect: {
          destination: '/study-room',
          permanent: false,
        },
      };
    }
    const messageCount = await prisma.postCounter.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    return {
      props: {
        assessmentsFromDB: JSON.stringify(assessments),
        assessmentId,
        messageCountFromDB: messageCount?.count,
      },
    };
  }

  return {
    redirect: {
      destination: '/api/auth/signin',
      permanent: false,
      callback: '/study-room',
    },
  };
};
