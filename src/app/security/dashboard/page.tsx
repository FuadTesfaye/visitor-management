'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  Search,
  ScanLine,
  UserCheck,
  UserCheck2,
  LogOut,
  AlertCircle,
  Plus,
  QrCode
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { VisitRequest } from '@/types';
import { useLanguage } from '@/lib/language-context';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function SecurityDashboard() {
  const [requests, setRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const { t } = useLanguage();
  
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    visitorName: '',
    faydaNumber: '',
    phone: '',
    branchId: '',
    departmentId: '',
    purpose: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm')
  });

  useEffect(() => {
    fetchRequests();
    fetchBranches();
  }, []);

  useEffect(() => {
    if (formData.branchId) {
      fetchDepartments(formData.branchId);
    } else {
      setDepartments([]);
    }
  }, [formData.branchId]);

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/branches');
      if (res.ok) {
        const data = await res.json();
        setBranches(data.branches);
      }
    } catch (e) {}
  };

  const fetchDepartments = async (bId: string) => {
    try {
      const res = await fetch(`/api/departments?branchId=${bId}`);
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments);
      }
    } catch (e) {}
  };

  const handleSubmitWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Walk-in request created. Pending approval.');
        setFormData({
          visitorName: '',
          faydaNumber: '',
          phone: '',
          branchId: '',
          departmentId: '',
          purpose: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm')
        });
        setShowForm(false);
        fetchRequests();
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

  const handleAction = async (endpoint: string, payload: any) => {
    setProcessing(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setScanInput('');
        fetchRequests();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput) return;
    
    // Check if what they typed is 14 digits = fayda, otherwise it's a code
    const method = scanInput.length === 14 ? 'fayda' : 'code';
    
    handleAction('/api/visits/check-in', {
      method,
      identifier: scanInput
    });
  };

  const handleListAction = (visitId: string, action: 'in' | 'out') => {
    handleAction(`/api/visits/check-${action}`, { visitId });
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
      default: 
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredRequests = requests.filter(req => {
    const term = searchTerm.toLowerCase();
    return (
      req.visitorName.toLowerCase().includes(term) ||
      req.visitCode?.toLowerCase().includes(term) ||
      req.faydaNumber.includes(term)
    );
  });

  const expectedToday = filteredRequests.filter(r => r.status === 'approved');
  const currentlyIn = filteredRequests.filter(r => r.status === 'checked-in');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Security Gate
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Manage visitor check-ins and check-outs for your branch.
            </p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="font-semibold shadow-lg shadow-primary/20 bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Quick Registration
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Quick Walk-in Registration</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitWalkIn} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="visitorName">Name</Label>
                    <Input id="visitorName" required value={formData.visitorName} onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })} placeholder="Guest Name" />
                  </div>
                  <div className="space-y-2 col-span-1">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="09..." />
                  </div>
                  <div className="space-y-2 col-span-1">
                    <Label htmlFor="faydaNumber">Fayda ID</Label>
                    <Input id="faydaNumber" required pattern="\\d{14}" maxLength={14} value={formData.faydaNumber} onChange={(e) => setFormData({ ...formData, faydaNumber: e.target.value.replace(/\\D/g, '') })} placeholder="14 Digits" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, branchId: value })} value={formData.branchId} required>
                      <SelectTrigger id="branch"><SelectValue placeholder="..." /></SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, departmentId: value })} value={formData.departmentId} required disabled={!formData.branchId}>
                      <SelectTrigger id="department"><SelectValue placeholder="..." /></SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="purpose">Reason</Label>
                    <Textarea id="purpose" required className="min-h-[80px]" value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} />
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Clock className="mr-2 h-4 w-4 animate-spin" />}
                    Register Walk-in
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900 border-t-4 border-t-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-blue-600" />
                Quick Check-in
              </CardTitle>
              <CardDescription>Enter Visit Code or 14-digit Fayda Number.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualCheckIn} className="flex flex-col gap-4">
                <Input 
                  placeholder="Code or Fayda ID..."
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  className="h-12 text-lg font-mono text-center tracking-widest placeholder:tracking-normal"
                />
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!scanInput || processing}
                >
                  {processing ? <Clock className="mr-2 h-5 w-5 animate-spin" /> : <UserCheck className="mr-2 h-5 w-5" />}
                  Check In Visitor
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <Card className="bg-neutral-50 dark:bg-neutral-900/50 shadow-none border-dashed border-2">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-medium text-neutral-500 mb-2 uppercase tracking-wider">Expected Today</span>
                  <span className="text-4xl font-black text-neutral-900 dark:text-neutral-100">{expectedToday.length}</span>
                </CardContent>
               </Card>
               <Card className="bg-blue-50 dark:bg-blue-900/10 shadow-none border-blue-200 dark:border-blue-900/50">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wider">Currently In</span>
                  <span className="text-4xl font-black text-blue-700 dark:text-blue-300">{currentlyIn.length}</span>
                </CardContent>
               </Card>
            </div>
          </div>
        </div>

        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
          <Tabs defaultValue="approved">
            <CardHeader className="bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800 pb-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <TabsList className="grid grid-cols-2 w-full sm:w-[300px]">
                  <TabsTrigger value="approved">Expected</TabsTrigger>
                  <TabsTrigger value="checked-in">On Premises</TabsTrigger>
                </TabsList>
                
                <div className="relative w-full sm:max-w-[250px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                  <Input 
                    placeholder="Search name, code, fayda..."
                    className="pl-9" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              
              <TabsContent value="approved" className="m-0 border-none outline-none">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : expectedToday.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <AlertCircle className="w-8 h-8 text-neutral-400 mb-3" />
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">No expected visitors</h3>
                    <p className="text-sm text-neutral-500 max-w-[280px]">All expected visitors have checked in.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-neutral-50/50">
                        <TableHead>Code</TableHead>
                        <TableHead>Visitor</TableHead>
                        <TableHead>{t('department')}</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expectedToday.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-mono font-bold text-primary tracking-widest">
                            {request.visitCode}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {request.visitorName}
                            </div>
                            <div className="text-xs text-neutral-500 mt-1 flex flex-col gap-0.5">
                              <span>Fayda: {request.faydaNumber}</span>
                              <span>Phone: {request.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-medium">{request.departmentName}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm"
                              className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-none"
                              onClick={() => handleListAction(request.id, 'in')}
                              disabled={processing}
                            >
                              <UserCheck2 className="h-4 w-4" />
                              <span>{t('checkIn')}</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="checked-in" className="m-0 border-none outline-none">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : currentlyIn.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <AlertCircle className="w-8 h-8 text-neutral-400 mb-3" />
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">No visitors on premises</h3>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-neutral-50/50">
                        <TableHead>Code</TableHead>
                        <TableHead>Visitor</TableHead>
                        <TableHead>{t('department')}</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentlyIn.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-mono font-bold text-neutral-500 tracking-widest">
                            {request.visitCode}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {request.visitorName}
                            </div>
                            <div className="text-xs text-neutral-500 mt-1 flex flex-col gap-0.5">
                              <span>{request.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-medium">{request.departmentName}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5 border-neutral-300 shadow-none hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              onClick={() => handleListAction(request.id, 'out')}
                              disabled={processing}
                            >
                              <LogOut className="h-4 w-4" />
                              <span>{t('checkOut')}</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

            </CardContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
}
