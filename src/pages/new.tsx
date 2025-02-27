import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function NewSpreadsheetPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    async function createSpreadsheet() {
      try {
        const response = await fetch('/api/spreadsheets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            name: 'Untitled Spreadsheet'
          }),
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to create spreadsheet');
        }

        // Redirect to the new spreadsheet
        router.push(`/spreadsheet/${result.data.id}`);
      } catch (error) {
        console.error('Error creating spreadsheet:', error);
        router.push('/?error=creation-failed');
      }
    }

    if (status === 'authenticated') {
      createSpreadsheet();
    }
  }, [status, router]);

  return (
    <>
      <Head>
        <title>Creating New Spreadsheet - Sheets Clone</title>
        <meta name="description" content="Creating a new spreadsheet..." />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </>
  );
}