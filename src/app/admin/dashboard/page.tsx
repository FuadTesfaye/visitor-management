'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ActiveVisitor {
  id: string;
  visitorName: string;
  departmentName: string;
  purpose: string;
  checkInTime: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeVisitors, setActiveVisitors] = useState<ActiveVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActiveVisitors();
  }, []);

  const fetchActiveVisitors = async () => {
    try {
      const response = await fetch('/api/visitors/active');
      if (response.ok) {
        const data = await response.json();
        setActiveVisitors(data.activeVisitors);
      }
    } catch (error) {
      setError('Failed to fetch active visitors');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (visitRequestId: string) => {
    setProcessing(visitRequestId);
    try {
      const response = await fetch('/api/scan/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitRequestId }),
      });

      if (response.ok) {
        fetchActiveVisitors();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to check out visitor');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setProcessing(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex space-x-4">
              <a
                href="/admin/scan"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
              >
                QR Scanner
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Active Visitors ({activeVisitors.length})
            </h2>
            <button
              onClick={fetchActiveVisitors}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : activeVisitors.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No active visitors</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Visitor Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Check-in Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeVisitors.map((visitor) => (
                    <tr key={visitor.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {visitor.visitorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {visitor.departmentName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{visitor.purpose}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(visitor.checkInTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleCheckOut(visitor.id)}
                          disabled={processing === visitor.id}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded disabled:opacity-50"
                        >
                          {processing === visitor.id ? 'Processing...' : 'Check Out'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <a
                href="/admin/scan"
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded text-center"
              >
                Scan QR Code
              </a>
              <button
                onClick={fetchActiveVisitors}
                className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
              >
                Refresh Data
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Visitors:</span>
                <span className="font-medium">{activeVisitors.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">System Status:</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">System Info</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Visitor Management System v1.0</p>
              <p>Role: System Administrator</p>
              <p>Access: Full System Control</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
