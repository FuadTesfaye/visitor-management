import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import { LanguageProvider } from '@/lib/language-context';
import { Toaster } from 'sonner';
import './globals.css';

const openSans = Open_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Tracon VMS',
  description: 'Visitor Management System for Tracon Trading PLC',
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
