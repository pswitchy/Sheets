import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { SpreadsheetListItem } from '@/types';

function RecentSpreadsheets() {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    let isMounted = true;

    async function fetchSpreadsheets() {
      try {
        console.log('Fetching spreadsheets...');
        
        const response = await fetch('/api/spreadsheets', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          credentials: 'include',
        });

        if (!isMounted) return;

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const text = await response.text();
          console.error('Response text:', text);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);

        if (!contentType || !contentType.toLowerCase().includes('application/json')) {
          console.error('Invalid content type:', contentType);
          throw new Error('Server returned invalid response format');
        }

        const text = await response.text();
        console.log('Response text:', text);

        const result = JSON.parse(text);
        console.log('Parsed result:', result);

        if (!isMounted) return;

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch spreadsheets');
        }

        setSpreadsheets(result.data || []);
        setError(null);

      } catch (err) {
        if (!isMounted) return;
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching spreadsheets');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchSpreadsheets();
    }

    return () => {
      isMounted = false;
    };
  }, [session]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <p className="font-semibold">Error loading spreadsheets</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setLoading(true);
            setError(null);
            window.location.reload();
          }}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (spreadsheets.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No spreadsheets yet</p>
        <Link href="/new">
          <Button variant="outline" className="mt-4">
            Create your first spreadsheet
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {spreadsheets.map((spreadsheet) => (
          <li key={spreadsheet.id}>
            <Link
              href={`/spreadsheet/${spreadsheet.id}`}
              className="block hover:bg-gray-50"
            >
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-600 truncate">
                    {spreadsheet.name}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="text-sm text-gray-500">
                      {new Date(spreadsheet.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Sheets Clone - Dashboard</title>
        <meta name="description" content="A spreadsheet application built with Next.js" />
        <meta name="author" content="parthsharma-git" />
        <meta name="last-modified" content="2025-02-26 12:47:50" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">My Spreadsheets</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/new">
                <Button>New Spreadsheet</Button>
              </Link>
              <div className="flex items-center space-x-2">
                <img
                  src={session.user.image || '/default-avatar.png'}
                  alt={session.user.name || 'User'}
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-sm text-gray-700">{session.user.name}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow">
            <RecentSpreadsheets />
          </div>
        </main>
      </div>
    </>
  );
}