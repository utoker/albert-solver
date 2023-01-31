import { type NextApiRequest, type NextApiResponse } from 'next';
import { OpenAIApi } from 'openai';
import { Configuration } from 'openai';
import { env } from '../../env/server.mjs';
import axios from 'axios';

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const generate = async (req: NextApiRequest, res: NextApiResponse) => {
  const { messages, count } = req.body;

  if (count === undefined) {
    res.status(500).json('unexpected error: message count is undefined');
  }
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `The following is a conversation with an AI assistant named Albert Solver. The assistant is helpful, creative, clever, and very friendly. The assistant answers in the language of the question. \n${messages}`,
      max_tokens: 2048,
      temperature: 0.7,
      top_p: 1,
      n: 1,
      stream: false,
      logprobs: null,
    });
    if (response.status !== 200) {
      res.status(500).json('Something went wrong');
    }
    await axios.get('/api/post-counter/increase-count');
    const result = response?.data?.choices[0]?.text;
    res.status(200).json(result);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(500).json(`${error.message} CATCH`);
  }
};

export default generate;
