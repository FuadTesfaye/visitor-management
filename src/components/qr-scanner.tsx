'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, RotateCcw, Zap, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRScannerProps {
  /** Called with the decoded QR string when a code is successfully scanned */
  onScan: (value: string) => void;
  /** Called when camera fails to start (optional) */
  onError?: (error: string) => void;
}

type ScannerState = 'idle' | 'starting' | 'scanning' | 'denied' | 'dismissed' | 'no-camera' | 'error';

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const CONTAINER_ID = 'html5-qr-scanner-container';
  const html5QrRef = useRef<any>(null);
  const cooldownRef = useRef(false);
  const lastScannedRef = useRef('');

  const [state, setState] = useState<ScannerState>('idle');
  const [errorDetail, setErrorDetail] = useState('');

  // Clean up scanner on unmount
  useEffect(() => {
    return () => { stopScanner(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopScanner = useCallback(async () => {
    if (!html5QrRef.current) return;
    try {
      const s = html5QrRef.current.getState?.();
      if (s === 2 || s === 3) {          // 2 = SCANNING, 3 = PAUSED
        await html5QrRef.current.stop();
      }
      html5QrRef.current.clear?.();
    } catch (_) {
      // ignore cleanup errors
    }
    html5QrRef.current = null;
  }, []);

  const startScanner = useCallback(async () => {
    setState('starting');
    setErrorDetail('');

    try {
      // Dynamic import avoids SSR issues with window/navigator
      const { Html5Qrcode } = await import('html5-qrcode');

      await stopScanner();

      html5QrRef.current = new Html5Qrcode(CONTAINER_ID);

      await html5QrRef.current.start(
        { facingMode: 'environment' },     // prefer rear camera
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
        (decoded: string) => {
          // Ignore rapid re-scans of the same token
          if (cooldownRef.current) return;
          if (decoded === lastScannedRef.current) return;
          cooldownRef.current = true;
          lastScannedRef.current = decoded;
          onScan(decoded);
          // 3-second cooldown so the same QR isn't fired twice
          setTimeout(() => { cooldownRef.current = false; }, 3000);
        },
        () => { /* frame-level "not found" — fires constantly, ignore */ }
      );

      setState('scanning');
    } catch (err: any) {
      const raw: string = err?.message ?? String(err);
      console.error('[QRScanner]', raw);

      await stopScanner();

      // Classify the error
      const lower = raw.toLowerCase();
      if (lower.includes('dismissed') || lower.includes('abort')) {
        // User closed the permission popup without choosing
        setState('dismissed');
      } else if (lower.includes('notallowed') || lower.includes('permission denied')) {
        setState('denied');
      } else if (lower.includes('notfound') || lower.includes('no cameras') || lower.includes('enumerate')) {
        setState('no-camera');
      } else {
        setState('error');
        setErrorDetail(raw);
      }

      onError?.(raw);
    }
  }, [onScan, onError, stopScanner]);

  // ─── UI helpers ────────────────────────────────────────────────────────────

  const RetryButton = ({ label = 'Try Again' }: { label?: string }) => (
    <Button size="sm" variant="outline" onClick={startScanner}
      className="mt-2 border-white/30 text-white hover:bg-white/10">
      <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
      {label}
    </Button>
  );

  return (
    <div className="w-full flex flex-col items-center gap-3">

      {/* ── Camera viewport ─────────────────────────────── */}
      <div className="relative w-full overflow-hidden rounded-xl border-2 border-dashed
                      border-neutral-300 dark:border-neutral-600 bg-neutral-950
                      aspect-square max-w-[320px] mx-auto">

        {/* html5-qrcode renders the <video> into this div */}
        <div id={CONTAINER_ID} className="w-full h-full" style={{ minHeight: 280 }} />

        {/* ── Overlay per state ── */}

        {/* IDLE — explicit start button */}
        {state === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-neutral-900/95 text-white">
            <div className="w-16 h-16 rounded-full bg-blue-600/20 border-2 border-blue-400/60
                            flex items-center justify-center">
              <Camera className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-center px-4">
              <p className="text-sm font-semibold text-white mb-1">Open Camera</p>
              <p className="text-xs text-neutral-400">Your browser will ask for camera permission.</p>
            </div>
            <Button onClick={startScanner}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6">
              <Play className="w-4 h-4 mr-2" />
              Start QR Scanner
            </Button>
          </div>
        )}

        {/* STARTING */}
        {state === 'starting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3
                          bg-neutral-900/90 text-white">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
            <p className="text-sm text-neutral-300">Starting camera…</p>
          </div>
        )}

        {/* DISMISSED — user closed the popup */}
        {state === 'dismissed' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3
                          bg-neutral-900/95 text-white p-5 text-center">
            <Camera className="w-10 h-10 text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-amber-300 mb-1">Permission not granted</p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                The camera request was dismissed. Click below to try again — 
                make sure to click <strong className="text-white">Allow</strong> when the browser asks.
              </p>
            </div>
            <RetryButton label="Request Permission Again" />
          </div>
        )}

        {/* DENIED — browser permission blocked */}
        {state === 'denied' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3
                          bg-neutral-900/95 text-white p-5 text-center">
            <CameraOff className="w-10 h-10 text-red-400" />
            <div>
              <p className="text-sm font-semibold text-red-300 mb-1">Camera access blocked</p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Allow camera access in your browser's address bar (🔒 icon) 
                then click Retry below.
              </p>
            </div>
            <RetryButton label="Retry After Allowing" />
          </div>
        )}

        {/* NO CAMERA */}
        {state === 'no-camera' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3
                          bg-neutral-900/95 text-white p-5 text-center">
            <CameraOff className="w-10 h-10 text-neutral-400" />
            <p className="text-sm text-neutral-300">No camera detected on this device.</p>
            <p className="text-xs text-neutral-500">Use the Visit Code or Fayda ID tabs instead.</p>
          </div>
        )}

        {/* GENERIC ERROR */}
        {state === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3
                          bg-neutral-900/95 text-white p-5 text-center">
            <CameraOff className="w-10 h-10 text-red-400" />
            <p className="text-xs text-red-300 leading-relaxed">{errorDetail || 'Could not start camera.'}</p>
            <RetryButton />
          </div>
        )}

        {/* SCANNING — live overlays */}
        {state === 'scanning' && (
          <>
            {/* Corner brackets */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60">
                {[
                  'top-0 left-0 border-t-4 border-l-4 rounded-tl-lg',
                  'top-0 right-0 border-t-4 border-r-4 rounded-tr-lg',
                  'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg',
                  'bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg',
                ].map((cls, i) => (
                  <div key={i} className={`absolute w-8 h-8 border-blue-400 ${cls}`} />
                ))}
                {/* Animated scan line */}
                <div className="absolute left-0 right-0 h-px bg-blue-400/90
                                shadow-[0_0_8px_2px_rgba(96,165,250,0.7)]"
                  style={{ animation: 'qr-scan 2s linear infinite' }} />
              </div>
            </div>

            {/* Status pill */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5
                            bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
              <Zap className="w-3 h-3 text-blue-400 animate-pulse" />
              <span>Scanning for QR code…</span>
            </div>
          </>
        )}
      </div>

      {/* Hint text */}
      {state === 'scanning' && (
        <p className="text-xs text-neutral-500 text-center max-w-[280px]">
          Hold the visitor's QR code steady in the frame. Check-in happens automatically.
        </p>
      )}

      {/* Scan line animation */}
      <style jsx>{`
        @keyframes qr-scan {
          0%   { top: 0; }
          50%  { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}
