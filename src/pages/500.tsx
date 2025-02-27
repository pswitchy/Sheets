import Link from 'next/link';
import Head from 'next/head';

export default function ServerErrorPage() {
  return (
    <>
      <Head>
        <title>500 - Server Error | Sheets Clone</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900">500</h1>
          <p className="mt-4 text-xl text-gray-600">Server Error</p>
          <p className="mt-2 text-gray-500">
            Something went wrong on our end. Please try again later.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </>
  );
}