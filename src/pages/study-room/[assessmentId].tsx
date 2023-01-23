import { Grid } from '@nextui-org/react';
import { type NextPage } from 'next';
import React from 'react';
import SideMenu from '../../components/SideMenu';
import ChatBox from '../../components/ChatBox';
import dynamic from 'next/dynamic';
import useSWR, { preload } from 'swr';
import axios from 'axios';

// This is a workaround for hydration issues with Next.js
const StudyNav = dynamic(() => import('../../components/StudyNav'), {
  ssr: false,
});

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

preload('/api/assessment/get-all', fetcher);
preload('/api/post-counter/get-count', fetcher);

const StudyRoom: NextPage = () => {
  const { data: assessments } = useSWR('/api/assessment/get-all', fetcher);
  return (
    <>
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
