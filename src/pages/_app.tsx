import type { AppProps } from 'next/app';
import { ToastProvider } from '@/hooks/useToast';
import '@/styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps<{session: Session}>) {
  return (
    <SessionProvider session={session}>
      <ToastProvider>
        <Component {...pageProps} />
        <Toaster />
      </ToastProvider>
    </SessionProvider>
  );
}

export default MyApp;