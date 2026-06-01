'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Bell,
  Coffee,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VisitRequest } from '@/types';
import { useLanguage } from '@/lib/language-context';

export default function VisitorDashboardOverview() {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    completed: 0
  });
  const [upcoming, setUpcoming] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/visits');
        if (res.ok) {
          const data = await res.json();
          const requests: VisitRequest[] = data.data;
          
          setStats({
            total: requests.length,
            approved: requests.filter(r => r.status === 'approved').length,
            pending: requests.filter(r => r.status === 'pending').length,
            completed: requests.filter(r => r.status === 'checked-out').length
          });

          // Upcoming visits: approved and requestedDateTime is in the future
          const now = new Date();
          const upcomingVisits = requests
            .filter(r => r.status === 'approved' && new Date(r.requestedDateTime) > now)
            .sort((a, b) => new Date(a.requestedDateTime).getTime() - new Date(b.requestedDateTime).getTime())
            .slice(0, 3);
            
          setUpcoming(upcomingVisits);
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
              Welcome back
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Here is an overview of your visits and requests.
            </p>
          </div>
          <Link href="/visitor/requests">
            <Button className="font-semibold shadow-lg shadow-primary/20">
              <FileText className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Completed Visits</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader>
              <CardTitle>Upcoming Visits</CardTitle>
              <CardDescription>Your next scheduled visits that have been approved.</CardDescription>
            </CardHeader>
            <CardContent>
              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-3">
                    <Calendar className="w-6 h-6 text-neutral-400" />
                  </div>
                  <p className="text-sm text-neutral-500">No upcoming visits scheduled.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcoming.map((visit) => (
                    <div key={visit.id} className="flex items-center p-4 border border-neutral-100 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <Coffee className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{visit.departmentName}</h4>
                        <p className="text-sm text-neutral-500">
                          {new Date(visit.requestedDateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(visit.requestedDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Link href="/visitor/passes">
                        <Button variant="outline" size="sm">View Pass</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-3 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Latest updates on your requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full shrink-0">
                    <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">System update successfully.</p>
                    <p className="text-xs text-neutral-500">Just now</p>
                  </div>
                </div>
                <Link href="/visitor/notifications" className="block text-center mt-4">
                  <Button variant="ghost" size="sm" className="w-full text-primary">
                    View all notifications <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
