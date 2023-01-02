import { type NextApiRequest, type NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

import { prisma } from '../../server/db/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // get the session
  const session = await getSession({ req });
  let newAssessmentName = '';
  if (req.body.assessmentName) newAssessmentName = req.body.assessmentName;
  // if (session?.user?.id) {
  //   const assessmentName = await prisma.assessment.update({
  //     where: {
  //       userId: session.user.id,
  //     },
  //     data: {
  //       assessmentName: newAssessmentName,
  //     },
  //   });
  //   res.status(200).json(assessmentName);
  // }
};

export default handler;
