'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar,
  Search
} from 'lucide-react';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { VisitRequest } from '@/types';
import { useLanguage } from '@/lib/language-context';

export default function VisitorHistory() {
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredVisits(visits);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredVisits(
        visits.filter(v => 
          v.departmentName.toLowerCase().includes(lower) || 
          v.purpose.toLowerCase().includes(lower) ||
          (v.visitCode && v.visitCode.toLowerCase().includes(lower))
        )
      );
    }
  }, [searchTerm, visits]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/visits');
      if (res.ok) {
        const data = await res.json();
        // Sort by date descending
        const sorted = data.data.sort((a: any, b: any) => 
          new Date(b.requestedDateTime).getTime() - new Date(a.requestedDateTime).getTime()
        );
        setVisits(sorted);
        setFilteredVisits(sorted);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': 
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1 font-semibold px-2 py-0.5"><Clock className="w-3 h-3" /> {t('pending')}</Badge>;
      case 'approved': 
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 font-semibold px-2 py-0.5"><CheckCircle2 className="w-3 h-3" /> {t('approved')}</Badge>;
      case 'checked-in': 
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 font-semibold px-2 py-0.5"><Building2 className="w-3 h-3" /> {t('checkedIn')}</Badge>;
      case 'checked-out': 
        return <Badge variant="outline" className="bg-neutral-50 text-neutral-700 border-neutral-200 gap-1 font-semibold px-2 py-0.5"><CheckCircle2 className="w-3 h-3" /> Completed</Badge>;
      case 'rejected': 
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 font-semibold px-2 py-0.5"><XCircle className="w-3 h-3" /> {t('rejected')}</Badge>;
      default: 
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              My Visits
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Your complete visit history and past requests.
            </p>
          </div>
        </div>

        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-800/20">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
              <Input
                type="search"
                placeholder="Search history..."
                className="pl-9 bg-white dark:bg-neutral-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-neutral-500">Loading history...</p>
              </div>
            ) : filteredVisits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">No visits found</h3>
                <p className="text-neutral-500">Your visit history will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Visit Code</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>{t('department')}</TableHead>
                      <TableHead>{t('purpose')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisits.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium text-primary">
                          {request.visitCode || '-'}
                        </TableCell>
                        <TableCell className="text-neutral-600 dark:text-neutral-400">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{format(new Date(request.requestedDateTime), 'MMM d, yyyy')}</span>
                            <span className="text-[11px] text-neutral-400">{format(new Date(request.requestedDateTime), 'h:mm a')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {request.departmentName}
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate text-neutral-600 dark:text-neutral-400">
                          {request.purpose}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
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
