'use client';

import { useState, useEffect } from 'react';
import { History as HistoryIcon, Clock, CheckCircle2, Building2, XCircle } from 'lucide-react';
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
import { VisitRequest } from '@/types';
import { Badge } from '@/components/ui/badge';

export default function HeadHistory() {
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
        setVisits(data.data.filter((r: VisitRequest) => 
          r.status !== 'pending' // History shows all non-pending visits
        ).sort((a: any, b: any) => new Date(b.requestedDateTime).getTime() - new Date(a.requestedDateTime).getTime()));
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
      case 'checked-in': 
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1"><Building2 className="w-3 h-3" /> In Building</Badge>;
      case 'checked-out': 
        return <Badge variant="outline" className="bg-neutral-50 text-neutral-700 border-neutral-200 gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</Badge>;
      case 'rejected': 
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
      default: 
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Visit History
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Log of all past and current visits for your department.
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
                <HistoryIcon className="w-12 h-12 text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No history found</h3>
                <p className="text-neutral-500">There are no logged visits.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Visitor Name</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visits.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell className="font-medium">
                          {visit.visitorName}
                          <div className="text-xs text-neutral-500">{visit.phone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{format(new Date(visit.requestedDateTime), 'MMM d, yyyy')}</span>
                            <span className="text-xs text-neutral-500">{format(new Date(visit.requestedDateTime), 'h:mm a')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm">
                          {visit.purpose}
                        </TableCell>
                        <TableCell>{getStatusBadge(visit.status)}</TableCell>
                        <TableCell className="text-sm text-neutral-500">
                          {visit.walkIn ? 'Walk-in' : 'Pre-registered'}
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
