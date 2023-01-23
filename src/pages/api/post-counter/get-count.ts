import { type NextApiRequest, type NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

import { prisma } from '../../../server/db/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  if (session?.user?.id) {
    const messageCount = await prisma.postCounter.findUnique({
      where: {
        userId: session.user.id,
      },
    });
    res.status(200).json(messageCount);
  }
};

export default handler;
