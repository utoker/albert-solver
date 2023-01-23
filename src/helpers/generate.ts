import { OpenAIApi } from 'openai';
import { Configuration } from 'openai';
import { env } from '../env/client.mjs';
import axios from 'axios';
import { type Session } from 'next-auth';

const generate = async (
  messages: string,
  messageCount: number,
  authSession: Session | null
) => {
  const configuration = new Configuration({
    apiKey: env.NEXT_PUBLIC_OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const subscription = authSession?.user?.subscription;

  if (messageCount === undefined) {
    return 'unexpected error: message count is undefined';
  }
  if (subscription === 'basic' && messageCount && messageCount > 9) {
    return 'You have reached your limit of 10 posts';
  }
  if (subscription === 'pro' && messageCount && messageCount > 49) {
    return 'You have reached your limit of 50 posts';
  }
  try {
    // delay 1 second
    // await new Promise((resolve) => setTimeout(resolve, 1000));

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
    // const result = 'good'; // temp
    if (response.status !== 200) {
      return 'Something went wrong';
    }
    await axios.get('/api/post-counter/increase-count');

    const result = response?.data?.choices[0]?.text;
    return result;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return `${error.message} generete error`;
  }
};

export default generate;
