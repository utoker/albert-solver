import type { NextRequest } from 'next/server';
import type { OpenAIStreamPayload } from '../../../utils/OpenAIStream';
import { OpenAIStream } from '../../../utils/OpenAIStream';

export const config = {
  runtime: 'edge',
};

const handler = async (req: NextRequest): Promise<Response> => {
  const { prompt } = (await req.json()) as {
    prompt?: string;
  };

  if (!prompt) {
    return new Response('No prompt in the request', { status: 400 });
  }

  const payload: OpenAIStreamPayload = {
    model: 'text-davinci-003',
    prompt: `The following is a conversation with an AI assistant named Albert Solver. The assistant is helpful, creative, clever, and very friendly. The assistant answers in the language of the question. \n${prompt}`,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 2048,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
};

export default handler;
