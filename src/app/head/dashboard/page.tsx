'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Check,
  X,
  AlertCircle
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
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VisitRequest } from '@/types';
import { useLanguage } from '@/lib/language-context';

export default function HeadDashboard() {
  const [requests, setRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedRequest, setSelectedRequest] = useState<VisitRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const { t } = useLanguage();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/visits');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.data);
      } else {
        toast.error('Failed to load requests');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    
    if (status === 'rejected' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`/api/visits/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          rejectionReason: status === 'rejected' ? rejectionReason : undefined
        }),
      });

      if (response.ok) {
        toast.success(`Request ${status} successfully`);
        setShowApproveModal(false);
        setShowRejectModal(false);
        setRejectionReason('');
        fetchRequests();
      } else {
        const data = await response.json();
        toast.error(data.error || `Failed to ${status} request`);
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setProcessing(false);
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
        return <Badge variant="outline" className="bg-neutral-50 text-neutral-700 border-neutral-200 gap-1 font-semibold px-2 py-0.5"><CheckCircle2 className="w-3 h-3" /> {t('checkedOut')}</Badge>;
      case 'rejected': 
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 font-semibold px-2 py-0.5"><XCircle className="w-3 h-3" /> {t('rejected')}</Badge>;
      default: 
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && ['approved', 'checked-in'].includes(req.status)) ||
                         req.status === statusFilter;
    
    const matchesSearch = req.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.purpose.toLowerCase().includes(searchQuery.toLowerCase());
                          
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Department Approvals
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Review and manage visit requests for your department.
            </p>
          </div>
        </div>

        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
          <CardHeader className="bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800 pb-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <Tabs defaultValue="all" onValueChange={setStatusFilter} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-4 w-full sm:w-[400px]">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending" className="relative">
                    {t('pending')}
                    {requests.filter(r => r.status === 'pending').length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-500"></span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="rejected">History</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="relative w-full sm:max-w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input 
                  placeholder={t('searchName')}
                  className="pl-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-neutral-500">Loading requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">No requests found</h3>
                <p className="text-sm text-neutral-500 max-w-[280px]">
                  {searchQuery ? "No requests match your search criteria." : "There are currently no visit requests matching this filter."}
                </p>
                {(searchQuery || statusFilter !== 'all') && (
                  <Button variant="link" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Visitor Info</TableHead>
                      <TableHead>Visit Details</TableHead>
                      <TableHead>{t('date')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {request.visitorName}
                          </div>
                          <div className="text-xs text-neutral-500 mt-1 flex flex-col gap-0.5">
                            <span className="flex items-center gap-1.5"><Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">{request.visitType}</Badge></span>
                            <span>Fayda: {request.faydaNumber}</span>
                            <span>Phone: {request.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[250px]">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                              {request.purpose}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                              {format(new Date(request.requestedDateTime), 'MMM d, yyyy')}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {format(new Date(request.requestedDateTime), 'h:mm a')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          {request.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRejectModal(true);
                                }}
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">{t('reject')}</span>
                              </Button>
                              <Button 
                                size="sm"
                                className="h-8 gap-1.5 bg-green-600 hover:bg-green-700 text-white shadow-none"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowApproveModal(true);
                                }}
                              >
                                <Check className="h-4 w-4" />
                                <span>{t('approve')}</span>
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-400 italic">No actions</span>
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

      {/* Approve Modal */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Approve Request
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this visit request? An access pass will be generated.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4 space-y-3">
              <div className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-md border border-neutral-100 dark:border-neutral-800">
                <p className="text-sm font-medium mb-1">{selectedRequest.visitorName}</p>
                <p className="text-xs text-neutral-500">
                  {format(new Date(selectedRequest.requestedDateTime), 'MMM d, yyyy • h:mm a')}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveModal(false)} disabled={processing}>Cancel</Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={() => handleStatusUpdate('approved')}
              disabled={processing}
            >
              {processing && <Clock className="mr-2 h-4 w-4 animate-spin" />}
              Approve Visit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={(open) => {
        if (!open) setRejectionReason('');
        setShowRejectModal(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Reject Request
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this visit request. The visitor will be notified.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2">
            <Label htmlFor="reason" className="text-right">Rejection Reason <span className="text-red-500">*</span></Label>
            <Textarea
              id="reason"
              placeholder="e.g., Schedule conflict, incorrect department..."
              className="col-span-3 mt-2"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)} disabled={processing}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => handleStatusUpdate('rejected')}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing && <Clock className="mr-2 h-4 w-4 animate-spin" />}
              Reject Visit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
