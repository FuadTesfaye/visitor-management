'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  Users,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VisitRequest } from '@/types';

export default function StaffDashboardOverview() {
  const [stats, setStats] = useState({
    todayRequests: 0,
    pendingApprovals: 0,
    walkInsToday: 0
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
            todayRequests: requests.filter(r => new Date(r.createdAt).toDateString() === today).length,
            pendingApprovals: requests.filter(r => r.status === 'pending').length,
            walkInsToday: requests.filter(r => r.walkIn && new Date(r.createdAt).toDateString() === today).length
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
              Staff Dashboard
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Manage visitors and walk-ins for your department.
            </p>
          </div>
          <Link href="/staff/offline">
            <Button className="font-semibold shadow-lg shadow-primary/20 bg-blue-600 hover:bg-blue-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Log Walk-in Visitor
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Requests Created Today</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.todayRequests}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.pendingApprovals}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Walk-ins Today</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.walkInsToday}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
