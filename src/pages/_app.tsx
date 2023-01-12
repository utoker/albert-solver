import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { NextUIProvider } from '@nextui-org/react';
import { SSRProvider } from 'react-aria';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SSRProvider>
      <SessionProvider session={session}>
        <NextUIProvider>
          <Component {...pageProps} />
        </NextUIProvider>
      </SessionProvider>
    </SSRProvider>
  );
};

export default MyApp;
