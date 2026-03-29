'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  User, 
  Building2, 
  Calendar, 
  AlertCircle,
  MoreVertical,
  History,
  ClipboardCheck
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { VisitRequest } from '@/types';

export default function ApproverDashboard() {
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VisitRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchVisitRequests();
  }, []);

  const fetchVisitRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/visits/list');
      if (response.ok) {
        const data = await response.json();
        setVisitRequests(data.visitRequests);
      }
    } catch (error) {
      toast.error('Failed to fetch visit requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const response = await fetch('/api/visits/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitRequestId: requestId }),
      });

      if (response.ok) {
        toast.success('Request approved successfully');
        fetchVisitRequests();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to approve request');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    setProcessing(selectedRequest.id);
    try {
      const response = await fetch('/api/visits/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          visitRequestId: selectedRequest.id, 
          rejectionReason 
        }),
      });

      if (response.ok) {
        toast.success('Request rejected');
        setShowRejectModal(false);
        setSelectedRequest(null);
        setRejectionReason('');
        fetchVisitRequests();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to reject request');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1"><Clock className="w-3 h-3" /> {status}</Badge>;
      case 'approved': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1"><CheckCircle2 className="w-3 h-3" /> {status}</Badge>;
      case 'checked-in': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1"><Building2 className="w-3 h-3" /> Checked In</Badge>;
      case 'checked-out': return <Badge variant="outline" className="bg-neutral-50 text-neutral-700 border-neutral-200 gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1"><XCircle className="w-3 h-3" /> {status}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingRequests = visitRequests.filter(req => req.status === 'pending');
  const historyRequests = visitRequests.filter(req => req.status !== 'pending');

  return (
    <DashboardLayout>
      <Toaster position="top-right" richColors />
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Approvals
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Review and manage visit requests for your department.
          </p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
            <TabsTrigger value="pending" className="gap-2 px-4 rounded-md">
              <Clock className="w-4 h-4" />
              Pending
              {pendingRequests.length > 0 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] h-4 min-w-[16px] px-1 font-bold">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 px-4 rounded-md">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
              <CardHeader className="bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Actions required for these visit requests.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-neutral-500">Loading requests...</p>
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                      <ClipboardCheck className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-semibold">No pending requests</h3>
                    <p className="text-sm text-neutral-500">All caught up! No requests currently need your attention.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Visitor</TableHead>
                          <TableHead>Fayda ID</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Requested For</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-neutral-400" />
                                {request.visitorName}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{request.faydaNumber}</TableCell>
                            <TableCell className="max-w-[250px] truncate">{request.purpose}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{format(new Date(request.requestedDateTime), 'MMM d, yyyy')}</span>
                                <span className="text-[11px] text-neutral-400">{format(new Date(request.requestedDateTime), 'h:mm a')}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 h-8 font-semibold shadow-sm"
                                onClick={() => handleApprove(request.id)}
                                disabled={processing === request.id}
                              >
                                {processing === request.id ? <Clock className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRejectModal(true);
                                }}
                                disabled={processing === request.id}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
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
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
              <CardHeader className="bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <CardTitle>Approval History</CardTitle>
                <CardDescription>Reference log of all past decisions.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {historyRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center text-neutral-500">
                    <History className="w-12 h-12 mb-4 opacity-20" />
                    No history found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Visitor</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.visitorName}</TableCell>
                            <TableCell>{request.departmentName}</TableCell>
                            <TableCell>
                              <span className="text-sm">{format(new Date(request.requestedDateTime), 'MMM d, yyyy h:mm a')}</span>
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Reject Request
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this visit request. This will be shared with the visitor.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-100 dark:border-neutral-700">
              <p className="text-xs uppercase font-bold text-neutral-400 tracking-widest mb-1">Visitor</p>
              <p className="text-sm font-semibold">{selectedRequest?.visitorName}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea 
                id="reason" 
                rows={4} 
                placeholder="Enter detailed reason here..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
            <Button 
              className="bg-red-600 hover:bg-red-700" 
              onClick={handleReject}
              disabled={!rejectionReason.trim() || processing === selectedRequest?.id}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
