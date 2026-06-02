'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Network, 
  Activity,
  LineChart,
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    locations: 0,
    departments: 0,
    activeVisits: 0,
    openIncidents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be a single comprehensive dashboard API call
    const fetchDashboardStats = async () => {
      try {
        const [usersRes, locationsRes, deptsRes, visitsRes, incidentsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/locations'),
          fetch('/api/departments'),
          fetch('/api/visits'),
          fetch('/api/incidents')
        ]);
        
        const users = usersRes.ok ? (await usersRes.json()).users : [];
        const locations = locationsRes.ok ? (await locationsRes.json()).locations : [];
        const depts = deptsRes.ok ? (await deptsRes.json()).departments : [];
        const visits = visitsRes.ok ? (await visitsRes.json()).data : [];
        const incidents = incidentsRes.ok ? (await incidentsRes.json()).incidents : [];
        
        setStats({
          users: users.length,
          locations: locations.length,
          departments: depts.length,
          activeVisits: visits.filter((v: any) => v.status === 'checked-in').length,
          openIncidents: incidents.filter((i: any) => i.status === 'open').length
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardStats();
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
              System Administration
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Manage locations, departments, users, and monitor system health.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/superadmin/settings">
              <Button variant="outline">System Settings</Button>
            </Link>
            <Link href="/superadmin/users">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.users}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Locationes</CardTitle>
              <Building2 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.locations}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Departments</CardTitle>
              <Network className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.departments}</div>
            </CardContent>
          </Card>
          
          <Card className={`border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow ${stats.openIncidents > 0 ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' : 'bg-white dark:bg-neutral-900'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${stats.openIncidents > 0 ? 'text-red-700 dark:text-red-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                Open Incidents
              </CardTitle>
              <ShieldAlert className={`h-4 w-4 ${stats.openIncidents > 0 ? 'text-red-600' : 'text-green-500'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stats.openIncidents > 0 ? 'text-red-700 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
                {stats.openIncidents}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           <Link href="/superadmin/monitor" className="group">
             <Card className="h-full bg-white dark:bg-neutral-900 hover:border-primary transition-colors cursor-pointer">
               <CardContent className="p-6 flex items-center gap-4">
                 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                   <Activity className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="font-bold text-lg">Approvals Monitor</h3>
                   <p className="text-sm text-neutral-500">Track pending and delayed approvals</p>
                 </div>
               </CardContent>
             </Card>
           </Link>
           
           <Link href="/superadmin/analytics" className="group">
             <Card className="h-full bg-white dark:bg-neutral-900 hover:border-primary transition-colors cursor-pointer">
               <CardContent className="p-6 flex items-center gap-4">
                 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                   <LineChart className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="font-bold text-lg">System Analytics</h3>
                   <p className="text-sm text-neutral-500">View visitor trends and reports</p>
                 </div>
               </CardContent>
             </Card>
           </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
