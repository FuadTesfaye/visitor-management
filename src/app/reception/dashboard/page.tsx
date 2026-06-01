'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarDays, 
  UserPlus, 
  Badge as BadgeIcon, 
  Clock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VisitRequest } from '@/types';
import { format } from 'date-fns';

export default function ReceptionDashboard() {
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const res = await fetch('/api/visits');
      if (res.ok) {
        const data = await res.json();
        setVisits(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaysAppointments = visits.filter(v => v.requestedDateTime && new Date(v.requestedDateTime).toISOString().startsWith(todayStr) && v.status === 'approved');
  const activeVisitors = visits.filter(v => v.status === 'checked-in');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Reception Desk
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Manage front-desk operations, visitors, and badges.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/reception/walkins">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <UserPlus className="w-4 h-4 mr-2" />
                Register Walk-in
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Today's Appointments</CardTitle>
              <CalendarDays className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{todaysAppointments.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Active Visitors</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{activeVisitors.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Active Badges</CardTitle>
              <BadgeIcon className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{activeVisitors.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Recent Walk-ins</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {visits.filter(v => v.requestedDateTime && new Date(v.requestedDateTime).toISOString().startsWith(todayStr) && v.visitCode?.startsWith('WK-')).length}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           <Link href="/reception/appointments" className="group">
             <Card className="h-full bg-white dark:bg-neutral-900 hover:border-primary transition-colors cursor-pointer">
               <CardContent className="p-6 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                     <CalendarDays className="w-6 h-6" />
                   </div>
                   <div>
                     <h3 className="font-bold text-lg">All Appointments</h3>
                     <p className="text-sm text-neutral-500">View upcoming scheduled visits</p>
                   </div>
                 </div>
                 <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-primary transition-colors" />
               </CardContent>
             </Card>
           </Link>
           
           <Link href="/reception/badges" className="group">
             <Card className="h-full bg-white dark:bg-neutral-900 hover:border-primary transition-colors cursor-pointer">
               <CardContent className="p-6 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                     <BadgeIcon className="w-6 h-6" />
                   </div>
                   <div>
                     <h3 className="font-bold text-lg">Badge Management</h3>
                     <p className="text-sm text-neutral-500">Assign and revoke visitor badges</p>
                   </div>
                 </div>
                 <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-primary transition-colors" />
               </CardContent>
             </Card>
           </Link>
           
           <Link href="/reception/directory" className="group">
             <Card className="h-full bg-white dark:bg-neutral-900 hover:border-primary transition-colors cursor-pointer">
               <CardContent className="p-6 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                     <Users className="w-6 h-6" />
                   </div>
                   <div>
                     <h3 className="font-bold text-lg">Staff Directory</h3>
                     <p className="text-sm text-neutral-500">Contact list for quick checks</p>
                   </div>
                 </div>
                 <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-primary transition-colors" />
               </CardContent>
             </Card>
           </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
