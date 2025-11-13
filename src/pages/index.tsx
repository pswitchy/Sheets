// src/pages/index.tsx

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { spreadsheetService } from '@/services/spreadsheetService';
import { SpreadsheetListItem } from '@/types'; // Assuming this type is defined in types/index.ts
import { Loader2, PlusCircle, AlertTriangle } from 'lucide-react';

function RecentSpreadsheets() {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchSpreadsheets = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the service layer for consistency
      const result = await spreadsheetService.getUserSpreadsheets();
      if (result.success) {
        setSpreadsheets(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch spreadsheets');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchSpreadsheets();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertTriangle className="mx-auto h-10 w-10 mb-2" />
        <p className="font-semibold">Error loading spreadsheets</p>
        <p className="text-sm mt-1">{error}</p>
        <Button variant="outline" onClick={fetchSpreadsheets} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (spreadsheets.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        <PlusCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
        <h3 className="text-lg font-medium">No spreadsheets yet</h3>
        <p className="text-sm mt-1">Get started by creating a new one.</p>
        <Link href="/new" passHref>
            <Button className="mt-4">Create your first spreadsheet</Button>
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {spreadsheets.map((sheet) => (
        <li key={sheet.id}>
          <Link href={`/spreadsheet/${sheet.id}`} passHref>
            <a className="block hover:bg-gray-50 transition-colors">
              <div className="px-6 py-4 flex items-center justify-between">
                <p className="text-sm font-medium text-blue-600 truncate">{sheet.name}</p>
                <p className="text-xs text-gray-500">
                  Updated {new Date(sheet.updatedAt).toLocaleString()}
                </p>
              </div>
            </a>
          </Link>
        </li>
      ))}
    </ul>
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
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!session) {
    return null; // or a redirect component
  }

  return (
    <>
      <Head>
        <title>Dashboard - Sheets Clone</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">My Spreadsheets</h1>
            <div className="flex items-center space-x-4">
              <Link href="/new" passHref>
                <Button>New Spreadsheet</Button>
              </Link>
              <div className="flex items-center space-x-2">
                <img
                  src={session.user.image || `https://avatar.vercel.sh/${session.user.email}.png`}
                  alt={session.user.name || 'User'}
                  className="h-8 w-8 rounded-full"
                />
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <RecentSpreadsheets />
          </div>
        </main>
      </div>
    </>
  );
}