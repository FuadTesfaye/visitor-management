'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function QRScanner() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visitorInfo, setVisitorInfo] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScanning(true);
      }
    } catch (err) {
      setError('Camera access denied or not available');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const handleManualTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const token = formData.get('token') as string;
    
    if (!token) {
      setError('Please enter a token');
      return;
    }

    await processToken(token);
  };

  const processToken = async (token: string) => {
    setLoading(true);
    setError('');
    setVisitorInfo(null);

    try {
      const response = await fetch('/api/scan/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: token }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(token);
        setVisitorInfo(data.visitor);
        stopCamera();
      } else {
        setError(data.error || 'Invalid QR code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const resetScanner = () => {
    setResult(null);
    setVisitorInfo(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">QR Scanner</h1>
            <div className="flex space-x-4">
              <a
                href="/admin/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
              >
                Dashboard
              </a>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {visitorInfo ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-green-600 mb-4">Check-in Successful!</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Visitor Information</h3>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {visitorInfo.name}</p>
                  <p><strong>Department:</strong> {visitorInfo.department}</p>
                  <p><strong>Purpose:</strong> {visitorInfo.purpose}</p>
                  <p><strong>Check-in Time:</strong> {new Date(visitorInfo.checkInTime).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={resetScanner}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
              >
                Scan Next
              </button>
              <a
                href="/admin/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
              >
                View Dashboard
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Scan QR Code</h2>
              
              {!scanning ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-gray-600 mb-4">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="mt-2">Camera is off</p>
                    </div>
                    <button
                      onClick={startCamera}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
                    >
                      Start Camera
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg"
                    />
                    <div className="absolute inset-0 border-2 border-green-500 rounded-lg pointer-events-none">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500"></div>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={stopCamera}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                    >
                      Stop Camera
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 text-center">
                    Note: QR scanning requires camera permissions. For demo purposes, use manual token entry below.
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Token Entry</h2>
              <p className="text-gray-600 mb-4">
                Enter the QR token manually if camera scanning is not available.
              </p>
              <form onSubmit={handleManualTokenSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token
                  </label>
                  <input
                    type="text"
                    name="token"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter QR token..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Process Token'}
                </button>
              </form>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Instructions</h3>
              <p className="text-sm text-blue-600">
                To test the system: 1) Submit a visit request as a visitor, 2) Approve it as an approver, 
                3) Copy the QR token from the approval response, 4) Use the manual token entry here to check in.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
