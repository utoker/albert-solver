import { type NextApiRequest, type NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

import { prisma } from '../../../server/db/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  const { assessmentId } = req.body;
  const { assessmentName } = req.body;

  if (session?.user?.id) {
    const newAssessmentName = await prisma.assessment.update({
      where: {
        id: assessmentId,
      },
      data: {
        assessmentName,
      },
    });
    res.status(200).json(newAssessmentName);
  }
};

export default handler;
