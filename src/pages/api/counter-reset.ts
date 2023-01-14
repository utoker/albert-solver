import { type NextApiRequest, type NextApiResponse } from 'next';

import { prisma } from '../../server/db/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await prisma.postCounter.updateMany({
    data: {
      count: 0,
    },
  });
  res.status(200).json('deleted');
};

export default handler;
