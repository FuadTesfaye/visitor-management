'use client';

import { useState, useEffect } from 'react';
import { LineChart, BarChart3, PieChart, Activity } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SuperAdminAnalytics() {
  const [stats, setStats] = useState({
    totalVisits: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/visits');
      if (res.ok) {
        const data = await res.json();
        const visits = data.data || [];
        
        setStats({
          totalVisits: visits.length,
          approved: visits.filter((v: any) => v.status === 'approved' || v.status === 'checked-in' || v.status === 'checked-out').length,
          rejected: visits.filter((v: any) => v.status === 'rejected').length,
          pending: visits.filter((v: any) => v.status === 'pending').length,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <LineChart className="w-8 h-8 text-primary" />
            System Analytics
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Global metrics and visitor trends across all branches.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Requests</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalVisits}</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Approved</CardTitle>
                <PieChart className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.approved}</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Pending</CardTitle>
                <Activity className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Rejected</CardTitle>
                <LineChart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.rejected}</div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm">
          <CardContent className="py-20 flex flex-col items-center justify-center text-center">
            <LineChart className="w-16 h-16 text-neutral-300 mb-4" />
            <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-100">Detailed Charts Unavailable</h3>
            <p className="text-neutral-500 mt-2 max-w-md">
              Full charting capabilities require external charting libraries (e.g. Recharts or Chart.js) which are not installed in the current setup.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
