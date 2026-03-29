'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Calendar, 
  Building2, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  QrCode as QrIcon,
  Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { VisitRequest, Department } from '@/types';

export default function VisitorDashboard() {
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VisitRequest | null>(null);
  
  const [formData, setFormData] = useState({
    visitorName: '',
    faydaNumber: '',
    departmentId: '',
    purpose: '',
    requestedDateTime: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [requestsRes, deptsRes] = await Promise.all([
        fetch('/api/visits/list'),
        fetch('/api/departments')
      ]);
      
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setVisitRequests(data.visitRequests);
      }
      
      if (deptsRes.ok) {
        const data = await deptsRes.json();
        setDepartments(data.departments);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/visits/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Visit request submitted successfully');
        setFormData({
          visitorName: '',
          faydaNumber: '',
          departmentId: '',
          purpose: '',
          requestedDateTime: '',
        });
        setShowForm(false);
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to submit request');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': 
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1 font-semibold capitalize px-2 py-0.5"><Clock className="w-3 h-3" /> {status}</Badge>;
      case 'approved': 
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 font-semibold capitalize px-2 py-0.5"><CheckCircle2 className="w-3 h-3" /> {status}</Badge>;
      case 'rejected': 
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 font-semibold capitalize px-2 py-0.5"><XCircle className="w-3 h-3" /> {status}</Badge>;
      default: 
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <Toaster position="top-right" richColors />
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Your Visits
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Manage and track your visit requests to the departments.
            </p>
          </div>

          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="font-semibold shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                New Visit Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Request a Visit</DialogTitle>
                <DialogDescription>
                  Fill in the details below to request access to a specific department.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="visitorName">Full Name</Label>
                    <Input 
                      id="visitorName" 
                      required 
                      placeholder="Enter your full name"
                      value={formData.visitorName}
                      onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faydaNumber">Fayda Number (14 digits)</Label>
                    <Input 
                      id="faydaNumber" 
                      required 
                      pattern="\d{14}"
                      maxLength={14}
                      placeholder="XXXXXXXXXXXXXX"
                      value={formData.faydaNumber}
                      onChange={(e) => setFormData({ ...formData, faydaNumber: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select 
                      onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                      required
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select dept" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="dateTime">Visit Date & Time</Label>
                    <Input 
                      id="dateTime" 
                      type="datetime-local" 
                      required
                      value={formData.requestedDateTime}
                      onChange={(e) => setFormData({ ...formData, requestedDateTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="purpose">Purpose of Visit</Label>
                    <Textarea 
                      id="purpose" 
                      required 
                      placeholder="Give a brief reason for your visit..."
                      className="min-h-[80px]"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Clock className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Request
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* List Section */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
          <CardHeader className="bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Requests</CardTitle>
                <CardDescription>View status and access passes of your requests.</CardDescription>
              </div>
              <div className="relative w-full max-w-[200px] hidden sm:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input placeholder="Search..." className="pl-9 h-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-neutral-500">Loading your visits...</p>
              </div>
            ) : visitRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">No visits found</h3>
                <p className="text-sm text-neutral-500 max-w-[280px]">
                  You haven't requested any visits yet. Create a new request to get started.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Make a Request
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[200px]">Department</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-neutral-400" />
                            {request.departmentName}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate text-neutral-600 dark:text-neutral-400">
                          {request.purpose}
                        </TableCell>
                        <TableCell className="text-neutral-600 dark:text-neutral-400">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{format(new Date(request.requestedDateTime), 'MMM d, yyyy')}</span>
                            <span className="text-[11px] text-neutral-400">{format(new Date(request.requestedDateTime), 'h:mm a')}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          {request.status === 'approved' && request.qrToken ? (
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="font-bold h-8 group hover:bg-primary hover:text-primary-foreground transition-all"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowQrModal(true);
                              }}
                            >
                              <QrIcon className="mr-2 h-3.5 w-3.5" />
                              Get Pass
                            </Button>
                          ) : request.status === 'rejected' ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                  <Info className="mr-2 h-3.5 w-3.5" />
                                  Reason
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2 text-red-600">
                                    <XCircle className="w-5 h-5" />
                                    Request Rejected
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-lg">
                                    <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                                      {request.rejectionReason || "No specific reason provided."}
                                    </p>
                                  </div>
                                  <p className="text-xs text-neutral-500 italic">
                                    Rejected on {format(new Date(request.rejectedAt || new Date()), 'MMM d, yyyy h:mm a')}
                                  </p>
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <Button size="sm" variant="ghost" disabled className="h-8 text-neutral-400">
                              <Clock className="mr-2 h-3.5 w-3.5" />
                              Pending
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

      {/* QR Code Modal */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center border border-green-200 dark:border-green-800 mb-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle>Access Pass Approved</DialogTitle>
            <DialogDescription>
              Show this QR code at the entrance to check in.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            {selectedRequest && selectedRequest.qrToken && (
              <>
                <div className="bg-white p-6 rounded-xl shadow-xl dark:bg-white mb-6">
                  <QRCodeSVG 
                    value={selectedRequest.qrToken} 
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-widest">
                    {selectedRequest.visitorName}
                  </p>
                  <p className="text-xs font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full inline-block">
                    Valid for: {selectedRequest.departmentName}
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="sm:justify-center">
            <Button className="w-full sm:w-auto px-8" onClick={() => setShowQrModal(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
