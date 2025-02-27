import Link from 'next/link';
import Head from 'next/head';

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | Sheets Clone</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <p className="mt-4 text-xl text-gray-600">Page not found</p>
          <p className="mt-2 text-gray-500">
            The page you're looking for doesn't exist or has been moved.
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