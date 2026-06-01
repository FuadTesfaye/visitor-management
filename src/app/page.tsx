'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center animate-pulse flex flex-col items-center">
        <Image src="/logo.png" alt="Tracon Logo" width={100} height={100} className="mb-6 object-contain" />
        <h1 className="text-2xl font-bold text-primary">Redirecting to login...</h1>
      </div>
    </div>
  );
}
