import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import localFont from "@next/font/local";
import { NextUIProvider } from "@nextui-org/react";
import "../styles/globals.css";

const myFont = localFont({ src: "./Mabry-Pro-Medium.ttf" });

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <main className={myFont.className}>
        <NextUIProvider>
          <Component {...pageProps} />
        </NextUIProvider>
      </main>
    </SessionProvider>
  );
};

export default MyApp;
