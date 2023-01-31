import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { SSRProvider } from 'react-aria';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import AppHead from '../components/AppHead';
import { createTheme, NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useState } from 'react';
import AppContext from '../components/AppContext';

const lightTheme = createTheme({
  type: 'light',
  theme: {
    colors: {
      background: '#fff',
    },
  },
});

const darkTheme = createTheme({
  type: 'dark',
  theme: {
    colors: {
      background: '#26292B',
    },
  },
});
config.autoAddCss = false;

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [stream, setStream] = useState('');
  const [prompt, setPrompt] = useState('');
  return (
    <NextUIProvider>
      <SSRProvider>
        <AppContext.Provider value={{ stream, setStream, prompt, setPrompt }}>
          <SessionProvider session={session}>
            <NextThemesProvider
              defaultTheme="system"
              attribute="class"
              value={{
                light: lightTheme.className,
                dark: darkTheme.className,
              }}
            >
              <AppHead />
              <Component {...pageProps} />
            </NextThemesProvider>
          </SessionProvider>
        </AppContext.Provider>
      </SSRProvider>
    </NextUIProvider>
  );
};

export default MyApp;
