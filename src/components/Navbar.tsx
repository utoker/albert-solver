import { type Assessment } from '@prisma/client';
import { type BuiltInProviderType } from 'next-auth/providers';
import { type ClientSafeProvider, type LiteralUnion } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { type FC } from 'react';
import Nav from './Nav';
import StudyNav from './StudyNav';

type chatLog = {
  user: string;
  message: string;
}[];

type Props = {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  >;
  assessments: Assessment[];
  setAssessments: React.Dispatch<React.SetStateAction<Assessment[]>>;
  chatLogs: { [key: string]: chatLog };
  setChatLog: React.Dispatch<React.SetStateAction<chatLog>>;
};

const Navbar: FC<Props> = ({
  assessments,
  chatLogs,
  providers,
  setAssessments,
  setChatLog,
}) => {
  const router = useRouter();
  // if router path name starts with /study-room, then render the study room navbar else render the normal navbar
  return router.pathname.startsWith('/study-room') ? (
    <StudyNav
      assessments={assessments}
      chatLogs={chatLogs}
      setAssessments={(x) => setAssessments(x)}
      setChatLog={(x) => setChatLog(x)}
    />
  ) : (
    <Nav providers={providers} />
  );
};

export default Navbar;
