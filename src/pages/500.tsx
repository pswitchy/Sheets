// src/pages/500.tsx

import Link from 'next/link';
import Head from 'next/head';
import { Button } from '@/components/ui/button';
import { ServerCrash } from 'lucide-react';

export default function ServerErrorPage() {
  return (
    <>
      <Head>
        <title>500 - Server Error | Sheets Clone</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <ServerCrash className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-800">Server Error</h1>
          <p className="mt-2 text-gray-500">
            Something went wrong on our end. Please try again later.
          </p>
          <Link href="/" passHref>
            <Button className="mt-6">Go back home</Button>
          </Link>
        </div>
      </div>
    </>
  );
}