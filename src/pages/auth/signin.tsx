import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function SignIn() {
  const router = useRouter();
  const { callbackUrl } = router.query;

  return (
    <>
      <Head>
        <title>Sign In | Sheets Clone</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome to Sheets Clone
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              A spreadsheet application built with Next.js
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <button
              onClick={() => signIn('github', { callbackUrl: callbackUrl as string || '/' })}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#24292F]"
            >
              <Image
                src="/github-mark-white.svg"
                alt="GitHub logo"
                width={20}
                height={20}
                className="mr-2"
              />
              Sign in with GitHub
            </button>
          </div>
        </div>
      </div>
    </>
  );
}