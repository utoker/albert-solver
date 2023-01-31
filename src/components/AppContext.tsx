import type { Dispatch, SetStateAction } from 'react';
import { createContext } from 'react';

type contexts = {
  stream: string;
  setStream: Dispatch<SetStateAction<string>>;
  prompt: string;
  setPrompt: Dispatch<SetStateAction<string>>;
};
const AppContext = createContext({} as contexts);
export default AppContext;
