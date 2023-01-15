import { type NextApiRequest, type NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

import { prisma } from '../../server/db/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  let newAssessmentName = '';
  const { assessmentId } = req.body;
  const { assessmentName } = req.body;
  if (req.body.assessmentName) newAssessmentName = assessmentName;
  if (session?.user?.id) {
    const assessmentName = await prisma.assessment.update({
      where: {
        id: assessmentId,
      },
      data: {
        assessmentName: newAssessmentName,
      },
    });
    res.status(200).json(assessmentName);
  }
};

export default handler;
