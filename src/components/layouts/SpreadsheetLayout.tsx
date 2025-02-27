import { ReactNode } from 'react';
import Head from 'next/head';

type SpreadsheetLayoutProps = {
  children: ReactNode;
};

export function SpreadsheetLayout({ children }: SpreadsheetLayoutProps) {
  return (
    <>
      <Head>
        <title>Sheets Clone - Online Spreadsheet Editor</title>
        <meta name="description" content="A modern spreadsheet editor built with Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex flex-col h-screen bg-white">
        {children}
      </div>
    </>
  );
}