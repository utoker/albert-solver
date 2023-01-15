import { type NextApiRequest, type NextApiResponse } from 'next';
import { env } from '../../env/server.mjs';

import { prisma } from '../../server/db/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const auth = req.headers.authorization;
  if (!auth || auth !== env.API_ROUTE_SECRET) {
    res.status(401).json('Unauthorized');
    return;
  }
  await prisma.postCounter.updateMany({
    data: {
      count: 0,
    },
  });
  res.status(200).json('Counter reset');
};

export default handler;
