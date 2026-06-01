'use client';

import { useState, useEffect } from 'react';
import { UserCheck, Clock, Search, LogOut } from 'lucide-react';
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

export default function SecurityActiveVisitors() {
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchActiveVisits();
  }, []);

  const fetchActiveVisits = async () => {
    try {
      const res = await fetch('/api/visits');
      if (res.ok) {
        const data = await res.json();
        setVisits(data.data.filter((r: VisitRequest) => r.status === 'checked-in'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (id: string) => {
    try {
      const res = await fetch(`/api/visits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'checked-out' })
      });
      
      if (res.ok) {
        toast.success('Visitor checked out successfully');
        setVisits(visits.filter(v => v.id !== id));
      } else {
        toast.error('Failed to check out visitor');
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
              <UserCheck className="w-8 h-8 text-green-500" />
              Active in Building
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              Currently {visits.length} visitors on premises.
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
                <UserCheck className="w-12 h-12 text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No active visitors</h3>
                <p className="text-neutral-500">
                  {search ? 'No visitors found matching your search.' : 'There are currently no checked-in visitors.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Visitor</TableHead>
                      <TableHead>Department & Person</TableHead>
                      <TableHead>Checked In At</TableHead>
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
                          <div className="text-xs text-neutral-500">To see: {visit.personToMeet}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                            <Clock className="w-3.5 h-3.5" />
                            {/* Typically you'd show the actual check-in time if stored separately, using updatedAt for now */}
                            {format(new Date(visit.checkedInAt || visit.requestedDateTime), 'h:mm a')}
                          </div>
                          <div className="text-xs text-neutral-400">
                            {format(new Date(visit.checkedInAt || visit.requestedDateTime), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">{visit.visitCode}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCheckout(visit.id)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <LogOut className="w-4 h-4 mr-1.5" />
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
      </div>
    </DashboardLayout>
  );
}
