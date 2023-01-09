import { Grid } from '@nextui-org/react';
import { type GetServerSideProps, type NextPage } from 'next';
import { getSession } from 'next-auth/react';
import React, { useCallback, useState } from 'react';
import { prisma } from '../../server/db/client';
import { type Assessment } from '@prisma/client';
import SideMenu from '../../components/SideMenu';
import ChatBox from '../../components/ChatBox';

type PageProps = {
  assessmentsFromDB: string;
  assessmentId: string;
};

const StudyRoom: NextPage<PageProps> = ({
  assessmentId,
  assessmentsFromDB,
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
  const chatLogsObject: chatLogsObject = {};
  useCallback(() => {
    assessments.forEach((assessment) => {
      chatLogsObject[assessment.id] = JSON.parse(assessment.chatLog);
    });
  }, [assessments, chatLogsObject]);

  const [chatLog, setChatLog] = useState(chatLogsObject[assessmentId] || []);
  const [chatLogs, setChatLogs] = useState(chatLogsObject);

  return (
    <Grid.Container css={{ height: 'calc(100vh - 76px)' }}>
      <Grid xs={0} sm={3} md={2}>
        <SideMenu
          assessments={assessments}
          chatLogs={chatLogs}
          setAssessments={(x) => setAssessments(x)}
          setChatLog={(x) => setChatLog(x)}
        />
      </Grid>
      <Grid xs={12} sm={9} md={10}>
        <ChatBox
          assessmentId={assessmentId}
          chatLog={chatLog}
          setChatLog={(x) => setChatLog(x)}
          setChatLogs={(x) => setChatLogs(x)}
        />
      </Grid>
    </Grid.Container>
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

    return {
      props: {
        assessmentsFromDB: JSON.stringify(assessments),
        assessmentId,
      },
    };
  }

  return {
    props: {},
  };
};
