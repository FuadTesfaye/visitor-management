'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Building2, 
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
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { VisitRequest, Department, Location } from '@/types';
import { useLanguage } from '@/lib/language-context';

export default function StaffDashboard() {
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [locations, setLocationes] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VisitRequest | null>(null);
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    visitorName: '',
    faydaNumber: '',
    phone: '',
    locationId: '',
    departmentId: '',
    hostEmployeeName: '',
    purpose: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm')
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.locationId) {
      fetchDepartments(formData.locationId);
    } else {
      setDepartments([]);
    }
  }, [formData.locationId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [requestsRes, locationsRes] = await Promise.all([
        fetch('/api/visits'),
        fetch('/api/locations')
      ]);
      
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setVisitRequests(data.data);
      }
      if (locationsRes.ok) {
        const data = await locationsRes.json();
        setLocationes(data.locations);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async (bId: string) => {
    try {
      const res = await fetch(`/api/departments?locationId=${bId}`);
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments);
      }
    } catch (e) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(t('submitRequest') + ' ' + 'successful!');
        setFormData({
          visitorName: '',
          faydaNumber: '',
          phone: '',
          locationId: '',
          departmentId: '',
          hostEmployeeName: '',
          purpose: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm')
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Department Requests
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Manage and track all visit requests for your department.
            </p>
          </div>
        </div>

        {/* List Section */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-neutral-500">Loading...</p>
              </div>
            ) : visitRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">No visits logged</h3>
                <Button variant="outline" className="mt-6" onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Log Walk-in Visitor
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Visitor</TableHead>
                      <TableHead className="w-[200px]">{t('department')}</TableHead>
                      <TableHead>{t('date')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.visitorName}
                          <div className="text-xs text-neutral-500">{request.phone}</div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="flex items-center gap-2">
                              {request.departmentName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-neutral-600 dark:text-neutral-400">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{format(new Date(request.requestedDateTime), 'MMM d, yyyy')}</span>
                            <span className="text-[11px] text-neutral-400">{format(new Date(request.requestedDateTime), 'h:mm a')}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          {(request.status === 'approved' || request.status === 'checked-in') && request.qrToken ? (
                            <Button 
                              size="sm" 
                              variant={request.status === 'checked-in' ? 'outline' : 'secondary'}
                              className="font-bold h-8 group hover:bg-primary hover:text-primary-foreground transition-all"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowQrModal(true);
                              }}
                            >
                              <QrIcon className="mr-2 h-3.5 w-3.5" />
                              Pass
                            </Button>
                          ) : request.status === 'rejected' ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                  <Info className="mr-2 h-3.5 w-3.5" />
                                  {t('reason')}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2 text-red-600">
                                    <XCircle className="w-5 h-5" />
                                    {t('rejected')}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-lg">
                                    <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                                      {request.rejectionReason || "No specific reason provided."}
                                    </p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <Button size="sm" variant="ghost" disabled className="h-8 text-neutral-400">
                              <Clock className="mr-2 h-3.5 w-3.5" />
                              {t('pending')}
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
            <DialogTitle>{t('approved')}</DialogTitle>
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
                <div className="text-center space-y-3">
                  <p className="text-2xl font-black text-primary tracking-widest">
                    {selectedRequest.visitCode}
                  </p>
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
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
