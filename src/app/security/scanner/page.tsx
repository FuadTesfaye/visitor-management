'use client';

import { useState } from 'react';
import { ScanLine, QrCode, Search, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import logoPic from '@/../public/logo.png';
import Image from 'next/image';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VisitRequest } from '@/types';

export default function SecurityScanner() {
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    data?: VisitRequest;
    message?: string;
  } | null>(null);

  const handleManualScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    
    setLoading(true);
    try {
      // In a real app, this would query an endpoint like /api/visits/scan?code=XYZ
      const res = await fetch('/api/visits');
      if (res.ok) {
        const data = await res.json();
        const visit = data.data.find((v: VisitRequest) => 
          v.visitCode === manualCode.toUpperCase() || v.smsOtp === manualCode
        );
        
        if (visit) {
          if (visit.status === 'approved') {
            setScanResult({ success: true, data: visit, message: 'Valid Pass. Ready for Check-in.' });
          } else if (visit.status === 'checked-in') {
            setScanResult({ success: true, data: visit, message: 'Visitor is already Checked-in. Ready for Check-out.' });
          } else {
            setScanResult({ success: false, message: `Pass is invalid. Status: ${visit.status}` });
          }
        } else {
          setScanResult({ success: false, message: 'No matching visit found for this code.' });
        }
      }
    } catch (e) {
      toast.error('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const processAction = async (action: 'check-in' | 'check-out') => {
    if (!scanResult?.data) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/visits/${scanResult.data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'check-in' ? 'checked-in' : 'checked-out' })
      });
      
      if (res.ok) {
        toast.success(`Successfully ${action.replace('-', ' ')} visitor.`);
        setScanResult(null);
        setManualCode('');
      } else {
        toast.error(`Failed to process ${action}`);
      }
    } catch (e) {
      toast.error('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Pass Scanner
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Scan visitor QR codes or enter Visit Codes / OTP manually to check them in or out.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Mock Camera View */}
          <Card className="bg-neutral-900 border-neutral-800 text-white overflow-hidden flex flex-col">
            <CardHeader className="bg-neutral-950 border-b border-neutral-800">
              <CardTitle className="flex items-center gap-3 text-white">
                <Image src={logoPic} alt="Logo" width={32} height={32} className="object-contain" />
                QR Camera
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative min-h-[300px] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40 z-10" />
              <div className="relative z-20 w-48 h-48 border-2 border-primary/50 rounded-xl flex items-center justify-center">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                <div className="w-full h-0.5 bg-primary/80 animate-scan absolute top-0" />
                <QrCode className="w-16 h-16 text-white/20" />
              </div>
              <p className="absolute bottom-4 z-20 text-sm text-neutral-400">
                Camera access simulated for demo
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <CardHeader>
                <CardTitle>Manual Entry</CardTitle>
                <CardDescription>Enter the Visit Code or SMS OTP.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualScan} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input 
                      placeholder="e.g. VIS-1234 or 123456" 
                      className="pl-10 uppercase"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={loading || !manualCode.trim()}>
                    Verify
                  </Button>
                </form>
              </CardContent>
            </Card>

            {scanResult && (
              <Card className={`border-2 ${scanResult.success ? 'border-green-500/50 bg-green-50 dark:bg-green-950/20' : 'border-red-500/50 bg-red-50 dark:bg-red-950/20'}`}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-4">
                    {scanResult.success ? (
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                        <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                      </div>
                    )}
                    
                    <div>
                      <h3 className={`text-xl font-bold ${scanResult.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                        {scanResult.message}
                      </h3>
                    </div>

                    {scanResult.success && scanResult.data && (
                      <div className="w-full text-left space-y-3 bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-neutral-500">Visitor</div>
                          <div className="font-medium text-right">{scanResult.data.visitorName}</div>
                          
                          <div className="text-neutral-500">Department</div>
                          <div className="font-medium text-right">{scanResult.data.departmentName}</div>
                          
                          <div className="text-neutral-500">Purpose</div>
                          <div className="font-medium text-right truncate">{scanResult.data.purpose}</div>
                        </div>

                        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                          {scanResult.data.status === 'approved' ? (
                            <Button 
                              onClick={() => processAction('check-in')} 
                              disabled={loading}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              Check In Visitor
                            </Button>
                          ) : scanResult.data.status === 'checked-in' ? (
                            <Button 
                              onClick={() => processAction('check-out')} 
                              disabled={loading}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              Check Out Visitor
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    )}
                    
                    {!scanResult.success && (
                      <Button variant="outline" onClick={() => setScanResult(null)}>
                        Clear Result
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Add scanner animation styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}} />
    </DashboardLayout>
  );
}
