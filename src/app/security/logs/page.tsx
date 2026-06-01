'use client';

import { useState, useEffect } from 'react';
import { ScrollText, Search, Filter } from 'lucide-react';
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

interface AuditLog {
  id: string;
  action: string;
  details: string;
  userId: string;
  ipAddress: string | null;
  createdAt: string;
}

export default function SecurityLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase()) ||
    log.userId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <ScrollText className="w-8 h-8 text-neutral-700 dark:text-neutral-300" />
              System Audit Logs
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              View comprehensive logs of system activity, check-ins, and state changes.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input 
              placeholder="Search logs..." 
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
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ScrollText className="w-12 h-12 text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No logs found</h3>
                <p className="text-neutral-500">
                  {search ? 'No logs match your search.' : 'There are no audit logs available.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="font-medium">{log.createdAt ? format(new Date(log.createdAt), 'MMM d, yyyy') : 'N/A'}</div>
                          <div className="text-xs text-neutral-500">{log.createdAt ? format(new Date(log.createdAt), 'h:mm:ss a') : 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 capitalize">
                            {log.action.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-neutral-500 truncate max-w-[120px]">
                          {log.userId}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {log.details}
                        </TableCell>
                        <TableCell className="text-xs text-neutral-500 font-mono">
                          {log.ipAddress || '-'}
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
