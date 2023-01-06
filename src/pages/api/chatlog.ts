import { type NextApiRequest, type NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

import { prisma } from '../../server/db/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // get the session
  const session = await getSession({ req });
  //   let newAssessmentName = '';
  const { assessmentId } = req.body;
  const { chatLog } = req.body;
  console.log('CHATLOG', chatLog);
  //   if (req.body.assessmentName) newAssessmentName = assessmentName;
  if (session?.user?.id) {
    const assessmentName = await prisma.assessment.update({
      where: {
        id: assessmentId,
      },
      data: {
        chatLog,
      },
    });
    res.status(200).json(assessmentName);
  }
};

export default handler;
