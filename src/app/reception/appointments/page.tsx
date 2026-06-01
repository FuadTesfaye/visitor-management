'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, Search, Clock, CheckCircle2, QrCode } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VisitRequest } from '@/types';
import { toast } from 'sonner';

export default function Appointments() {
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const res = await fetch('/api/visits');
      if (res.ok) {
        const data = await res.json();
        // Show approved and checked-in visits
        setVisits(data.data.filter((r: VisitRequest) => 
          ['approved', 'checked-in'].includes(r.status)
        ).sort((a: any, b: any) => new Date(a.requestedDateTime).getTime() - new Date(b.requestedDateTime).getTime()));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async (id: string) => {
    try {
      // In a real app, this might open a dialog to assign a badge first
      const res = await fetch(`/api/visits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'checked-in' })
      });
      if (res.ok) {
        toast.success('Visitor checked in successfully');
        fetchVisits();
      }
    } catch (e) {
      toast.error('Check-in failed');
    }
  };

  const filteredVisits = visits.filter(v => 
    v.visitorName.toLowerCase().includes(search.toLowerCase()) ||
    (v.visitCode && v.visitCode.toLowerCase().includes(search.toLowerCase())) ||
    (v.personToMeet && v.personToMeet.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <CalendarDays className="w-8 h-8 text-blue-500" />
              All Appointments
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              View and manage all scheduled upcoming visits.
            </p>
          </div>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <Input 
            placeholder="Search by visitor name, host, or visit code..." 
            className="pl-9 bg-white dark:bg-neutral-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredVisits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <CalendarDays className="w-12 h-12 text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No appointments found</h3>
                <p className="text-neutral-500">
                  {search ? 'No appointments match your search.' : 'There are no upcoming scheduled appointments.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Visitor</TableHead>
                      <TableHead>Visit Code</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisits.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">{visit.visitorName}</div>
                          <div className="text-xs text-neutral-500">{visit.phone}</div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {visit.visitCode}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {format(new Date(visit.requestedDateTime), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" /> {format(new Date(visit.requestedDateTime), 'HH:mm')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{visit.personToMeet}</div>
                          <div className="text-xs text-neutral-500">{visit.departmentName}</div>
                        </TableCell>
                        <TableCell>
                          {visit.status === 'checked-in' ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Checked In
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Approved
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {visit.status === 'approved' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleManualCheckIn(visit.id)}
                            >
                              Check In
                            </Button>
                          )}
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
