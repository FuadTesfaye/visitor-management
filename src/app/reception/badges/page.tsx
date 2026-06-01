'use client';

import { useState, useEffect } from 'react';
import { Badge as BadgeIcon, Search, AlertCircle, CheckCircle2, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

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

export default function BadgeManagement() {
  const [activeVisits, setActiveVisits] = useState<any[]>([]);
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
        // Show checked-in visitors (they have an active badge)
        setActiveVisits(data.data.filter((r: any) => r.status === 'checked-in'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const res = await fetch(`/api/visits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'checked-out' })
      });
      if (res.ok) {
        toast.success('Badge revoked successfully');
        setActiveVisits(activeVisits.filter(v => v.id !== id));
      } else {
        toast.error('Failed to revoke badge');
      }
    } catch (e) {
      toast.error('Network error');
    }
  };

  const filteredVisits = activeVisits.filter(v => 
    v.visitorName.toLowerCase().includes(search.toLowerCase()) ||
    (v.visitCode && v.visitCode.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
            <Image src="/logo.png" alt="Tracon Logo" width={32} height={32} className="object-contain" />
            Badge Management
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Track and manage active visitor badges.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input 
              placeholder="Search active badges by name or code..." 
              className="pl-9 bg-white dark:bg-neutral-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 shrink-0">
            {activeVisits.length} Active Badges
          </Badge>
        </div>

        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredVisits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <BadgeIcon className="w-12 h-12 text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No active badges</h3>
                <p className="text-neutral-500">
                  {search ? 'No active badges match your search.' : 'There are currently no active visitors.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Visitor</TableHead>
                      <TableHead>Visit Code</TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisits.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <UserCircle2 className="w-4 h-4 text-neutral-400" />
                            {visit.visitorName}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm font-medium text-purple-600 dark:text-purple-400">
                          {visit.visitCode}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{visit.personToMeet}</div>
                          <div className="text-xs text-neutral-500">{visit.departmentName}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleRevoke(visit.id)}
                          >
                            Revoke Badge
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
