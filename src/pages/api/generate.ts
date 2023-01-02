import { type NextApiRequest, type NextApiResponse } from 'next';
import { OpenAIApi } from 'openai';
import { configuration } from '../../../utils/constants';
// import { prisma } from '../../server/db/client';

const openai = new OpenAIApi(configuration);

type Data = {
  result?: string;
  error?: string;
};

const generate = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const { messages } = req.body;

  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `You are a super intelligent AI made for helping students with their homework and assessments. \n${messages}`,
    max_tokens: 64,
    temperature: 0.7,
    top_p: 1,
    n: 1,
    stream: false,
    logprobs: null,
    // stop: "\n",
  });
  if (response === undefined) {
    res.status(500).json({ error: 'Something went wrong' });
  }
  const result = response?.data?.choices[0]?.text;
  // prisma create assessment
  res.status(200).json({ result });
};

export default generate;
