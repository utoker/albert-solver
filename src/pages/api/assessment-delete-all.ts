import { type NextApiRequest, type NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

import { prisma } from '../../server/db/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // get the session
  const session = await getSession({ req });
  if (session?.user?.id) {
    await prisma.assessment.deleteMany({
      where: {
        userId: req.body.userId,
      },
    });
    res.status(200).json('deleted');
  }
};

export default handler;
