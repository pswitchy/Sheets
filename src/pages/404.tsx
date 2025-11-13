// src/pages/404.tsx

import Link from 'next/link';
import Head from 'next/head';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | Sheets Clone</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <FileQuestion className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-800">Page Not Found</h1>
          <p className="mt-2 text-gray-500">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <Link href="/" passHref>
            <Button className="mt-6">Go back home</Button>
          </Link>
        </div>
      </div>
    </>
  );
}