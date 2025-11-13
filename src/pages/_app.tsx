// src/pages/_app.tsx

import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps<{session: Session}>) {
  return (
    <SessionProvider session={session}>
        <Component {...pageProps} />
        <Toaster position="bottom-right" />
    </SessionProvider>
  );
}

export default MyApp;