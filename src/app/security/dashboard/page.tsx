'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ScanLine, 
  UserCheck, 
  AlertTriangle,
  Clock,
  History
} from 'lucide-react';
import Link from 'next/link';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VisitRequest } from '@/types';

export default function SecurityDashboard() {
  const [stats, setStats] = useState({
    activeVisitors: 0,
    expectedToday: 0,
    totalScansToday: 0,
    incidentsToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/visits');
        if (res.ok) {
          const data = await res.json();
          const requests: VisitRequest[] = data.data;
          
          const today = new Date().toDateString();
          
          setStats({
            activeVisitors: requests.filter(r => r.status === 'checked-in').length,
            expectedToday: requests.filter(r => r.status === 'approved' && new Date(r.requestedDateTime).toDateString() === today).length,
            totalScansToday: requests.filter(r => (r.status === 'checked-in' || r.status === 'checked-out') && new Date(r.updatedAt).toDateString() === today).length,
            incidentsToday: 0 // Will hook up to real incident API later
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Security Dashboard
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Monitor active visitors, process check-ins, and log incidents.
            </p>
          </div>
          <Link href="/security/scanner">
            <Button className="font-bold shadow-lg shadow-primary/20 bg-blue-600 hover:bg-blue-700 py-6 px-8 text-lg">
              <ScanLine className="mr-2 h-6 w-6" />
              Scan QR / Pass
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Active in Building</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.activeVisitors}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Expected Today</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.expectedToday}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Scans Today</CardTitle>
              <History className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalScansToday}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Incidents Today</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.incidentsToday}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
