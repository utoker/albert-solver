import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { NextUIProvider } from '@nextui-org/react';
import { SSRProvider } from 'react-aria';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import AppHead from '../components/AppHead';
// import { preload } from 'swr';
// import axios from 'axios';

// const fetcher = (url: string) => axios.get(url).then((res) => res.data);

// preload('/api/stripe/get-prices', fetcher);
config.autoAddCss = false;

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SSRProvider>
      <SessionProvider session={session}>
        <NextUIProvider>
          <AppHead />
          <Component {...pageProps} />
        </NextUIProvider>
      </SessionProvider>
    </SSRProvider>
  );
};

export default MyApp;
