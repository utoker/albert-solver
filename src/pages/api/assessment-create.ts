import { type NextApiRequest, type NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

import { prisma } from '../../server/db/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // get the session
  const session = await getSession({ req });
  const { chatLog } = req.body;
  const { assessmentName } = req.body;

  if (session?.user?.id) {
    const newAssessment = await prisma.assessment.create({
      data: {
        userId: session.user.id,
        assessmentName,
        chatLog,
      },
    });
    res.status(200).json({ newAssessment });
  }
};

export default handler;
