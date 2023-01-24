import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { SSRProvider } from 'react-aria';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import AppHead from '../components/AppHead';
import { createTheme, NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

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
  return (
    <SSRProvider>
      <SessionProvider session={session}>
        <NextThemesProvider
          defaultTheme="system"
          attribute="class"
          value={{
            light: lightTheme.className,
            dark: darkTheme.className,
          }}
        >
          <NextUIProvider>
            <AppHead />
            <Component {...pageProps} />
          </NextUIProvider>
        </NextThemesProvider>
      </SessionProvider>
    </SSRProvider>
  );
};

export default MyApp;
