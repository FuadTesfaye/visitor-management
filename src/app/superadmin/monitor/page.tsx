'use client';

import { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { VisitRequest } from '@/types';

export default function ApprovalsMonitor() {
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
        // Show only pending, approved, or rejected from the last 7 days
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 7);
        
        setVisits(data.data.filter((r: VisitRequest) => 
          r.createdAt && new Date(r.createdAt) > recentDate && 
          ['pending', 'approved', 'rejected'].includes(r.status)
        ).sort((a: any, b: any) => (b.createdAt && a.createdAt) ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': 
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</Badge>;
      case 'rejected': 
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
      case 'pending': 
      default:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Activity className="w-8 h-8 text-primary" />
            Approvals Monitor
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Global view of department head approvals and pending requests.
          </p>
        </div>

        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : visits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Activity className="w-12 h-12 text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No requests found</h3>
                <p className="text-neutral-500">There are no recent visit requests to monitor.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Created At</TableHead>
                      <TableHead>Visitor</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Host (To Visit)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visits.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                            {visit.createdAt && format(new Date(visit.createdAt), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {visit.createdAt && format(new Date(visit.createdAt), 'h:mm a')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{visit.visitorName}</div>
                          <div className="text-xs text-neutral-500">{visit.purpose}</div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {visit.departmentName}
                        </TableCell>
                        <TableCell>
                          {visit.personToMeet}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(visit.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
