'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  ArrowDownLeft,
  Search,
  Building2,
  Calendar,
  MoreVertical,
  ChevronRight,
  LogOut,
  CalendarDays,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { format } from 'date-fns';
import { toast, Toaster } from 'sonner';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { VisitRequest, VisitLog } from '@/types';

interface DashboardStats {
  totalVisits: number;
  activeVisitors: number;
  pendingApprovals: number;
  completedVisits: number;
}

export default function AdminDashboard() {
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [activeVisitors, setActiveVisitors] = useState<(VisitRequest & { log?: VisitLog })[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalVisits: 0,
    activeVisitors: 0,
    pendingApprovals: 0,
    completedVisits: 0
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [requestsRes, activeRes] = await Promise.all([
        fetch('/api/visits/list'),
        fetch('/api/visitors/active')
      ]);

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setVisitRequests(data.visitRequests);
        
        // Calculate stats
        const requests = data.visitRequests as VisitRequest[];
        setStats({
          totalVisits: requests.length,
          activeVisitors: 0, // Will be set by activeRes
          pendingApprovals: requests.filter(r => r.status === 'pending').length,
          completedVisits: requests.filter(r => r.status === 'approved').length // Approximation
        });
      }

      if (activeRes.ok) {
        const data = await activeRes.json();
        setActiveVisitors(data.activeVisitors);
        setStats(prev => ({ ...prev, activeVisitors: data.activeVisitors.length }));
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const response = await fetch('/api/scan/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitRequestId: requestId }),
      });

      if (response.ok) {
        toast.success('Visitor checked out successfully');
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Checkout failed');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setProcessing(null);
    }
  };

  const StatCard = ({ title, value, icon: Icon, description, trend, color }: any) => (
    <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900 group">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-neutral-500 uppercase tracking-wider">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color} bg-opacity-10 transition-transform group-hover:scale-110`}>
          <Icon className={`h-4 w-4 ${color.replace('bg-', 'text-')}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
          {trend ? (
            <>
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">{trend}</span> 
            </>
          ) : (
            <span className="h-3 w-3" />
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <Toaster position="top-right" richColors />
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            System Overview
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Monitor visitor traffic and active sessions across all departments.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Sessions" 
            value={stats.totalVisits} 
            icon={CalendarDays} 
            description="Since system launch"
            color="bg-blue-600"
          />
          <StatCard 
            title="Active Visitors" 
            value={stats.activeVisitors} 
            icon={UserCheck} 
            description="Currently in premises"
            trend={stats.activeVisitors > 0 ? "+Active" : ""}
            color="bg-green-600"
          />
          <StatCard 
            title="Pending Requests" 
            value={stats.pendingApprovals} 
            icon={Clock} 
            description="Requiring attention"
            trend={stats.pendingApprovals > 5 ? "High" : ""}
            color="bg-yellow-600"
          />
          <StatCard 
            title="Completed" 
            value={stats.completedVisits} 
            icon={UserPlus} 
            description="Successful check-ins"
            color="bg-purple-600"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
          {/* Active Visitors Table */}
          <Card className="lg:col-span-4 border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
            <CardHeader className="bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Currently Inside</CardTitle>
                  <CardDescription>Real-time tracked visitors in the building.</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 animate-pulse border-green-200">Live Traffic</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-20 flex justify-center"><Clock className="w-8 h-8 animate-spin text-neutral-300" /></div>
              ) : activeVisitors.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center text-neutral-500">
                  <UserCheck className="w-12 h-12 mb-4 opacity-10" />
                  <p>No visitors are currently checked in.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Visitor</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Checked In</TableHead>
                        <TableHead className="text-right">Pass Control</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeVisitors.map((visitor) => (
                        <TableRow key={visitor.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{visitor.visitorName}</span>
                              <span className="text-[10px] text-neutral-400 font-mono">ID: {visitor.faydaNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <MapPin className="w-3 h-3 text-red-500" />
                              {visitor.departmentName}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {visitor.log?.checkInTime ? format(new Date(visitor.log.checkInTime), 'h:mm a') : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 border-red-200 text-red-600 hover:bg-red-50 font-bold group"
                              onClick={() => handleCheckout(visitor.id)}
                              disabled={processing === visitor.id}
                            >
                              {processing === visitor.id ? <Clock className="w-3 h-3 animate-spin" /> : <ArrowDownLeft className="mr-1 w-3 h-3 group-hover:translate-x-[-2px] group-hover:translate-y-[2px] transition-transform" />}
                              Check Out
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Logs / Activity Column */}
          <Card className="lg:col-span-3 border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
            <CardHeader className="bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest status changes and requests.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {visitRequests.slice(0, 6).map((request, i) => (
                  <div key={request.id} className="flex gap-4 relative">
                    {i !== Math.min(visitRequests.length, 6) - 1 && (
                      <div className="absolute left-4 top-8 bottom-[-24px] w-[1px] bg-neutral-100 dark:bg-neutral-800" />
                    )}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10",
                      request.status === 'approved' ? 'bg-green-100 text-green-600' : 
                      request.status === 'rejected' ? 'bg-red-100 text-red-600' : 
                      'bg-yellow-100 text-yellow-600'
                    )}>
                      {request.status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> : 
                       request.status === 'rejected' ? <XCircle className="w-4 h-4" /> : 
                       <Clock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {request.visitorName}
                        </p>
                        <span className="text-[10px] font-medium text-neutral-400">
                          {format(new Date(request.requestedDateTime), 'h:mm a')}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 line-clamp-1">
                        Request to {request.departmentName} was {request.status}.
                      </p>
                    </div>
                  </div>
                ))}
                {visitRequests.length > 6 && (
                  <Button variant="ghost" className="w-full text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 py-2 h-auto">
                    View full history <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
