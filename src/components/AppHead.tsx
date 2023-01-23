import React from 'react';
import Head from 'next/head';

const AppHead = () => {
  return (
    <Head>
      <title>Albert Solver</title>
      <meta
        name="description"
        content="Get expert help with your assessments and improve your grades with our AI-powered website. Ask our AI any question and receive accurate and reliable answers quickly. Perfect for students of all levels looking to excel in their studies."
      />
      <link
        rel="preload"
        href="/api/stripe/get-prices"
        as="fetch"
        crossOrigin="anonymous"
      ></link>
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

export default AppHead;
