import { Grid } from '@nextui-org/react';
import { type NextPage } from 'next';
import React from 'react';
import SideMenu from '../../components/SideMenu';
import ChatBox from '../../components/ChatBox';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import fetcher from '../../utils/Fetcher';

// This is a workaround for hydration issues with Next.js
const StudyNav = dynamic(() => import('../../components/StudyNav'), {
  ssr: false,
});

type Props = {
  assessmentId: string;
};

const StudyRoom: NextPage<Props> = () => {
  // Redirect to login page if not authenticated
  const route = useRouter();
  const { status } = useSession();
  if (status === 'unauthenticated') route.push('/');

  // SWR for assessments
  const { data: assessments } = useSWR('/api/assessment/get-all', fetcher);

  return (
    <>
      <Head>
        <link
          rel="preload"
          href="/api/assessment/get-all"
          as="fetch"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/api/post-counter/get-count"
          as="fetch"
          crossOrigin="anonymous"
        />
      </Head>
      <StudyNav assessments={assessments || []} />
      <Grid.Container css={{ height: 'calc(100vh - 76px)' }}>
        <Grid xs={0} sm={2} md={1.5}>
          <SideMenu assessments={assessments || []} />
        </Grid>
        <Grid xs={12} sm={10} md={10.5}>
          <ChatBox />
        </Grid>
      </Grid.Container>
    </>
  );
};

export default StudyRoom;
