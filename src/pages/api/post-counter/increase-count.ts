import { type NextApiRequest, type NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '../../../server/db/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  const userId = session?.user?.id;

  if (session?.user?.id) {
    await prisma.postCounter.update({
      where: {
        userId: userId,
      },
      data: {
        count: { increment: 1 },
      },
    });
    res.status(200).json('count increased');
  }
};

export default handler;
