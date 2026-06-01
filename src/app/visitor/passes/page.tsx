'use client';

import { useState, useEffect } from 'react';
import { QrCode as QrIcon, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VisitRequest } from '@/types';
import { useLanguage } from '@/lib/language-context';
import { format } from 'date-fns';

export default function VisitorPasses() {
  const [activePasses, setActivePasses] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchPasses = async () => {
      try {
        const res = await fetch('/api/visits');
        if (res.ok) {
          const data = await res.json();
          const requests: VisitRequest[] = data.data;
          
          // Filter for active passes (approved or checked-in) that have a QR token
          const passes = requests.filter(r => 
            (r.status === 'approved' || r.status === 'checked-in') && r.qrToken
          );
          
          setActivePasses(passes);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPasses();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            My QR Passes
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Your active digital passes for building entry.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : activePasses.length === 0 ? (
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                <QrIcon className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No Active Passes</h3>
              <p className="text-neutral-500">You don't have any active approved visits at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activePasses.map((pass) => (
              <Card key={pass.id} className="overflow-hidden border-2 border-primary/20 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 shadow-lg relative">
                {pass.status === 'checked-in' && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Checked In
                  </div>
                )}
                <CardHeader className="text-center pb-2 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col items-center">
                  <Image src="/logo.png" alt="Tracon Logo" width={48} height={48} className="mb-2 object-contain" />
                  <CardTitle className="text-2xl font-black text-primary tracking-widest">{pass.visitCode}</CardTitle>
                  <CardDescription className="uppercase tracking-widest font-bold text-neutral-900 dark:text-neutral-100 mt-1">{pass.visitorName}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pt-8 pb-6">
                  <div className="bg-white p-4 rounded-xl shadow-md mb-6 ring-1 ring-neutral-200">
                    <QRCodeSVG 
                      value={pass.qrToken!} 
                      size={180}
                      level="H"
                      includeMargin={false}
                      imageSettings={{
                        src: "/logo.png",
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                      }}
                    />
                  </div>
                  
                  <div className="w-full space-y-3 px-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500 flex items-center"><Calendar className="w-4 h-4 mr-2" /> Date</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">{format(new Date(pass.requestedDateTime), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500 flex items-center"><Clock className="w-4 h-4 mr-2" /> Time</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">{format(new Date(pass.requestedDateTime), 'h:mm a')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-800">
                      <span className="text-neutral-500">Destination</span>
                      <span className="font-bold text-primary">{pass.departmentName}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
