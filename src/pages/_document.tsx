// src/pages/_document.tsx

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* SEO and PWA Meta Tags */}
        <meta name="description" content="A modern, collaborative spreadsheet application built with Next.js." />
        <meta name="application-name" content="Sheets Clone" />
        <meta name="author" content="parthsharma-git" />
        <meta name="theme-color" content="#ffffff" />
        
        {/* Favicons and App Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Optional: Preconnect to Google Fonts if you use them */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <body className="bg-gray-50 antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}