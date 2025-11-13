// src/pages/new.tsx

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { spreadsheetService } from '@/services/spreadsheetService';
import { Loader2 } from 'lucide-react';

export default function NewSpreadsheetPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    const createAndRedirect = async () => {
      try {
        const result = await spreadsheetService.createSpreadsheet();

        if (!result.success || !result.data?.id) {
          throw new Error(result.error || 'Failed to create spreadsheet: Invalid response from server.');
        }

        // Redirect to the newly created spreadsheet
        router.push(`/spreadsheet/${result.data.id}`);
      } catch (error) {
        console.error('Error creating spreadsheet:', error);
        // Redirect back to the dashboard with an error query param
        router.push('/?error=creation-failed');
      }
    };

    if (status === 'authenticated') {
      createAndRedirect();
    }
  }, [status, router]);

  return (
    <>
      <Head>
        <title>Creating New Spreadsheet...</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-600">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="mt-4 text-lg">Creating your new spreadsheet...</p>
      </div>
    </>
  );
}