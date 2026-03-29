'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
  QrCode, 
  Camera, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  User, 
  Building2, 
  History,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast, Toaster } from 'sonner';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScanResult {
  status: 'success' | 'error';
  message: string;
  visitor?: {
    name: string;
    department: string;
    fayda: string;
  };
  type?: 'check-in' | 'check-out';
  timestamp: Date;
}

export default function AdminScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScanning) {
      // Small timeout to ensure the DOM element with ID 'qr-reader' is rendered
      const timeoutId = setTimeout(() => {
        const qrReaderElement = document.getElementById('qr-reader');
        if (!qrReaderElement) {
          console.error('[SCANNER] qr-reader element not found even after render');
          return;
        }

        scanner = new Html5QrcodeScanner(
          "qr-reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ],
            rememberLastUsedCamera: true,
          },
          /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanError);
        scannerRef.current = scanner;
        
        console.log('[SCANNER] Initialized and rendering');
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(err => {
            console.warn('[SCANNER] Cleanup error (already cleared?):', err);
          });
          scannerRef.current = null;
        }
      };
    }
  }, [isScanning]);

  const startScanner = async () => {
    try {
      // Check for camera permission first if possible
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      setIsScanning(true);
    } catch (err) {
      console.error('[SCANNER] Permission denied or no camera:', err);
      setHasPermission(false);
      toast.error('Camera permission denied or camera not found');
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    // Pause scanner to give feedback
    if (scannerRef.current) {
      scannerRef.current.pause();
    }

    try {
      toast.loading('Processing token...', { id: 'scan-process' });
      
      // Try check-in first
      let response = await fetch('/api/scan/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: decodedText }),
      });

      let data = await response.json();
      let type: 'check-in' | 'check-out' = 'check-in';

      // If check-in fails because already checked in, try check-out
      if (!response.ok && data.error === 'Visitor already checked in') {
        response = await fetch('/api/scan/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrToken: decodedText }),
        });
        data = await response.json();
        type = 'check-out';
      }

      if (response.ok) {
        toast.success(`Successful ${type}`, { id: 'scan-process' });
        const result: ScanResult = {
          status: 'success',
          message: data.message,
          visitor: {
            name: data.visitorName || data.visitRequest?.visitorName || 'Unknown',
            department: data.departmentName || data.visitRequest?.departmentName || 'Security',
            fayda: data.visitRequest?.faydaNumber || 'XXXXXXXXXXXXXX'
          },
          type,
          timestamp: new Date()
        };
        setLastResult(result);
        setScanHistory(prev => [result, ...prev].slice(0, 10));
        
        // Success audio feedback (mock)
        playFeedbackSound(true);
      } else {
        toast.error(data.error || 'Invalid or expired token', { id: 'scan-process' });
        const result: ScanResult = {
          status: 'error',
          message: data.error || 'Scan failed',
          timestamp: new Date()
        };
        setLastResult(result);
        playFeedbackSound(false);
      }
    } catch (error) {
      toast.error('Network error processing scan', { id: 'scan-process' });
    } finally {
      // Resume scanner after 2 seconds
      setTimeout(() => {
        if (scannerRef.current && isScanning) {
          scannerRef.current.resume();
        }
      }, 2000);
    }
  };

  const onScanError = (errorMessage: string) => {
    // We don't want to flood the UI with errors from the library
    // console.warn(`QR error: ${errorMessage}`);
  };

  const playFeedbackSound = (success: boolean) => {
    // In a real browser we might play a beep
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().then(() => {
        setIsScanning(false);
        scannerRef.current = null;
      }).catch(console.error);
    }
  };

  return (
    <DashboardLayout>
      <Toaster position="top-right" richColors />
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Security Portal
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Scan visitor passes for seamless check-in and check-out tracking.
            </p>
          </div>
          <Badge variant="outline" className="h-8 gap-2 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-3">
            <ShieldCheck className="w-4 h-4" />
            Security Mode Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Scanner Card */}
          <Card className="border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden bg-white dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800">
            <CardHeader className="bg-neutral-900 text-white pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Live Scanner</CardTitle>
                  <CardDescription className="text-neutral-400">Align QR code within the frame.</CardDescription>
                </div>
                {isScanning && (
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Live Feed</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-square w-full relative bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border-b border-neutral-100 dark:border-neutral-800">
                {!isScanning ? (
                  <div className="p-12 text-center space-y-6 flex flex-col items-center">
                    <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center text-neutral-400">
                      <Camera className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Camera Disabled</h3>
                      <p className="text-sm text-neutral-500 max-w-[280px]">
                        Start the scanner and grant camera permissions to begin processing visitors.
                      </p>
                    </div>
                    <Button 
                      size="lg" 
                      onClick={startScanner}
                      className="w-full sm:w-auto px-12 h-12 text-md font-bold shadow-lg"
                    >
                      <Camera className="mr-2 h-5 w-5" />
                      Initialize Camera
                    </Button>
                  </div>
                ) : (
                  <div id="qr-reader" className="w-full h-full overflow-hidden" />
                )}
                
                {/* Overlay Feedback for success/error */}
                {lastResult && (
                  <div className={cn(
                    "absolute inset-0 z-10 flex items-center justify-center transition-all duration-300 pointer-events-none",
                    lastResult.status === 'success' 
                      ? (lastResult.type === 'check-out' ? "bg-blue-500/20" : "bg-green-500/20") 
                      : "bg-red-500/20"
                  )}>
                    <div className={cn(
                      "p-8 rounded-full shadow-2xl animate-in zoom-in-95 backdrop-blur-md flex flex-col items-center gap-2",
                      lastResult.status === 'success' 
                        ? (lastResult.type === 'check-out' ? "bg-blue-600 text-white" : "bg-green-600 text-white") 
                        : "bg-red-600 text-white"
                    )}>
                      {lastResult.status === 'success' ? <CheckCircle2 className="w-16 h-16" /> : <XCircle className="w-16 h-16" />}
                      <span className="text-xs font-bold uppercase tracking-widest">
                        {lastResult.status === 'success' ? lastResult.type : 'Error'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            {isScanning && (
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 flex justify-center">
                <Button variant="outline" size="sm" onClick={stopScanner} className="text-neutral-600 gap-2">
                  <RefreshCcw className="w-4 h-4" />
                  Reset Scanner
                </Button>
              </div>
            )}
          </Card>

          {/* Results Side */}
          <div className="space-y-6">
            {/* Last Result Card */}
            <Card className={cn(
              "border-dashed border-2 shadow-sm",
              lastResult?.status === 'success' ? "border-green-500 bg-green-50/10" : 
              lastResult?.status === 'error' ? "border-red-500 bg-red-50/10" : 
              "border-neutral-200 dark:border-neutral-800"
            )}>
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  Latest Scan Result
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[160px] flex items-center justify-center">
                {!lastResult ? (
                  <div className="text-center text-neutral-400 py-8">
                    <p className="text-sm italic">Scan a code to see details here.</p>
                  </div>
                ) : lastResult.status === 'success' ? (
                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">
                            {lastResult.visitor?.name}
                          </h4>
                          <Badge className={cn(
                            "text-[10px] uppercase h-4 px-1.5",
                            lastResult.type === 'check-in' ? "bg-green-600" : "bg-blue-600"
                          )}>
                            {lastResult.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-neutral-500">
                          <span className="flex items-center gap-1 font-medium"><Building2 className="w-3 h-3" /> {lastResult.visitor?.department}</span>
                          <span className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded uppercase">ID: {lastResult.visitor?.fayda}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-neutral-900 border border-green-100 dark:border-green-800 rounded-lg shadow-sm">
                      <p className="text-sm font-medium text-green-800 dark:text-green-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {lastResult.message}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4 py-4 w-full">
                    <div className="inline-flex p-3 bg-red-100 text-red-600 rounded-full mb-2">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-red-600">Scan Failed</h4>
                    <p className="text-sm text-neutral-500 font-medium px-4">{lastResult.message}</p>
                    <Button variant="outline" size="sm" onClick={() => setLastResult(null)} className="mt-2">Clear Result</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* History Card */}
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
              <CardHeader className="bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800 py-3">
                <CardTitle className="text-md flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Recent Session History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {scanHistory.length === 0 ? (
                  <div className="py-12 text-center text-neutral-400 text-xs italic">
                    No scans in current session.
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto">
                    {scanHistory.map((scan, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "p-4 flex items-center justify-between border-b last:border-0 border-neutral-100 dark:border-neutral-800",
                          scan.status === 'error' ? "bg-red-50/30" : "bg-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            scan.status === 'success' ? "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" : "bg-red-100 text-red-600"
                          )}>
                            {scan.status === 'success' ? <User className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold truncate max-w-[140px]">
                              {scan.visitor?.name || 'Invalid Token'}
                            </p>
                            <p className="text-[10px] text-neutral-400 uppercase font-black tracking-tighter">
                              {scan.status === 'success' ? `${scan.type} • ` : ''}{format(scan.timestamp, 'h:mm:ss a')}
                            </p>
                          </div>
                        </div>
                        {scan.status === 'success' && (
                          <Badge variant="outline" className="text-[9px] uppercase font-bold py-0 h-4 border-neutral-300">
                            {scan.visitor?.department}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
