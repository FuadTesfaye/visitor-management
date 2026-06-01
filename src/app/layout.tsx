import type { Metadata, Viewport } from 'next';
import { Open_Sans } from 'next/font/google';
import { LanguageProvider } from '@/lib/language-context';
import { Toaster } from 'sonner';
import './globals.css';

const openSans = Open_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#1c3745',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Tracon VMS',
  description: 'Visitor Management System for Tracon Trading PLC',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tracon VMS',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
