'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Search, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { VisitRequest } from '@/types';
import { Badge } from '@/components/ui/badge';

export default function HeadApprovals() {
  const [requests, setRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/visits');
      if (res.ok) {
        const data = await res.json();
        // Only pending requests need approval
        setRequests(data.data.filter((r: VisitRequest) => r.status === 'pending'));
      }
    } catch (e) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/visits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      if (res.ok) {
        toast.success('Request approved successfully');
        setRequests(requests.filter(r => r.id !== id));
      } else {
        toast.error('Failed to approve request');
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;

    setProcessing(rejectingId);
    try {
      const res = await fetch(`/api/visits/${rejectingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', rejectionReason })
      });
      if (res.ok) {
        toast.success('Request rejected');
        setRequests(requests.filter(r => r.id !== rejectingId));
        setRejectingId(null);
        setRejectionReason('');
      } else {
        toast.error('Failed to reject request');
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Pending Approvals
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Review and approve or reject visitor requests for your department.
          </p>
        </div>

        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-neutral-500">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">All caught up!</h3>
                <p className="text-neutral-500">There are no pending requests to review.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Visitor</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.visitorName}
                          <div className="text-xs text-neutral-500 font-mono mt-1">ID: {request.faydaNumber}</div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="truncate text-sm text-neutral-600 dark:text-neutral-300" title={request.purpose}>
                            {request.purpose}
                          </p>
                          {request.walkIn && (
                            <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 text-[10px]">Walk-in</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{format(new Date(request.requestedDateTime), 'MMM d, yyyy')}</span>
                            <span className="text-xs text-neutral-500">{format(new Date(request.requestedDateTime), 'h:mm a')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-neutral-600 dark:text-neutral-400">
                          {request.walkIn ? 'Staff (Walk-in)' : 'Self (Visitor)'}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                            disabled={processing === request.id}
                            onClick={() => handleApprove(request.id)}
                          >
                            {processing === request.id ? <Clock className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                            Approve
                          </Button>
                          
                          <Dialog open={rejectingId === request.id} onOpenChange={(open) => {
                            if (!open) {
                              setRejectingId(null);
                              setRejectionReason('');
                            } else {
                              setRejectingId(request.id);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
                                disabled={processing === request.id}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Visit Request</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleReject}>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Reason for Rejection</label>
                                    <Textarea 
                                      placeholder="Please provide a reason..."
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      required
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button type="button" variant="outline" onClick={() => setRejectingId(null)}>
                                    Cancel
                                  </Button>
                                  <Button type="submit" variant="destructive" disabled={processing === request.id}>
                                    {processing === request.id ? 'Processing...' : 'Confirm Reject'}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
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
