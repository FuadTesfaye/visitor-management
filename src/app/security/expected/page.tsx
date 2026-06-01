'use client';

import { useState, useEffect } from 'react';
import { Clock, Search, LogIn } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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

export default function SecurityExpectedVisitors() {
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchExpectedVisits();
  }, []);

  const fetchExpectedVisits = async () => {
    try {
      const res = await fetch('/api/visits');
      if (res.ok) {
        const data = await res.json();
        // Show only 'approved' visits whose date is >= today
        const todayStr = new Date().toISOString().split('T')[0];
        setVisits(data.data.filter((r: VisitRequest) => 
          r.status === 'approved' && r.requestedDateTime.startsWith(todayStr)
        ));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      const res = await fetch(`/api/visits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'checked-in' })
      });
      
      if (res.ok) {
        toast.success('Visitor checked in successfully');
        setVisits(visits.filter(v => v.id !== id));
      } else {
        toast.error('Failed to check in visitor');
      }
    } catch (e) {
      toast.error('Network error occurred.');
    }
  };

  const filteredVisits = visits.filter(v => 
    v.visitorName.toLowerCase().includes(search.toLowerCase()) ||
    v.visitCode?.toLowerCase().includes(search.toLowerCase()) ||
    v.departmentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Clock className="w-8 h-8 text-blue-500" />
              Expected Today
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              Currently {visits.length} visitors approved and expected to arrive today.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input 
              placeholder="Search by name, code or dept..." 
              className="pl-9 bg-white dark:bg-neutral-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredVisits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Clock className="w-12 h-12 text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No expected visitors</h3>
                <p className="text-neutral-500">
                  {search ? 'No visitors found matching your search.' : 'There are no approved visits scheduled for today.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Visitor</TableHead>
                      <TableHead>Department & Host</TableHead>
                      <TableHead>Scheduled Time</TableHead>
                      <TableHead>Code</TableHead>
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
                        <TableCell>
                          <div className="font-medium">{visit.departmentName}</div>
                          <div className="text-xs text-neutral-500">Host: {visit.personToMeet}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {format(new Date(visit.requestedDateTime), 'h:mm a')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">{visit.visitCode}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCheckIn(visit.id)}
                            className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <LogIn className="w-4 h-4 mr-1.5" />
                            Check In
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
      </div>
    </DashboardLayout>
  );
}
