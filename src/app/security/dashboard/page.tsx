'use client';

import { useState, useEffect, useRef } from 'react';
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
  QrCode,
  Hash,
  Fingerprint,
  User as UserIcon,
  X,
  ShieldCheck
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

type SearchMethod = 'code' | 'fayda' | 'name' | 'qr';

export default function SecurityDashboard() {
  const [requests, setRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [searchMethod, setSearchMethod] = useState<SearchMethod>('code');
  const [processing, setProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{success: boolean; message: string; visitor?: any} | null>(null);
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
    personToMeet: '',
    purpose: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    walkIn: true
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
        body: JSON.stringify({ ...formData, walkIn: true }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`✓ ${formData.visitorName} registered and checked in! Code: ${data.visitCode}`);
        setFormData({
          visitorName: '',
          faydaNumber: '',
          phone: '',
          branchId: '',
          departmentId: '',
          personToMeet: '',
          purpose: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm'),
          walkIn: true
        });
        setShowForm(false);
        fetchRequests();
      } else {
        toast.error(data.error || 'Failed to register walk-in visitor');
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
    setLastResult(null);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setLastResult({ success: true, message: data.message, visitor: data.visitor });
        toast.success(data.message);
        setScanInput('');
        fetchRequests();
      } else {
        setLastResult({ success: false, message: data.error });
        toast.error(data.error);
      }
    } catch (error) {
      const msg = 'Network error. Please try again.';
      setLastResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    
    let method: SearchMethod = searchMethod;
    // Auto-detect: 14 digits = fayda, VIS- prefix = code
    if (searchMethod === 'code' && /^\d{14}$/.test(scanInput)) {
      method = 'fayda';
    }
    
    handleAction('/api/visits/check-in', {
      method,
      identifier: scanInput.trim()
    });
  };

  const handleListAction = (visitId: string, action: 'in' | 'out') => {
    handleAction(`/api/visits/check-${action}`, { visitId });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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
      req.faydaNumber.includes(term) ||
      req.departmentName.toLowerCase().includes(term)
    );
  });

  const expectedVisitors = filteredRequests.filter(r => r.status === 'approved');
  const currentlyIn = filteredRequests.filter(r => r.status === 'checked-in');

  const searchMethodConfig = [
    { id: 'code' as SearchMethod, label: 'Visit Code', icon: Hash, placeholder: 'VIS-1234', hint: 'Enter the visit code (e.g., VIS-4821)' },
    { id: 'fayda' as SearchMethod, label: 'Fayda ID', icon: Fingerprint, placeholder: '14-digit Fayda number', hint: 'Enter 14-digit national ID number' },
    { id: 'name' as SearchMethod, label: 'Name Search', icon: UserIcon, placeholder: 'Search visitor name', hint: 'Type part of the visitor\'s name' },
    { id: 'qr' as SearchMethod, label: 'QR Token', icon: QrCode, placeholder: 'Paste QR token here', hint: 'Paste QR code value or use camera' },
  ];

  const activeMethod = searchMethodConfig.find(m => m.id === searchMethod)!;

  return (
    <DashboardLayout>
      <Toaster richColors position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
              Security Gate
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              Manage visitor check-ins and check-outs for your branch.
            </p>
          </div>
          
          {/* Walk-in Registration */}
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="font-semibold shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Walk-in Registration
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Quick Walk-in Registration
                </DialogTitle>
                <p className="text-sm text-neutral-500">Visitor will be immediately checked in upon registration.</p>
              </DialogHeader>
              <form onSubmit={handleSubmitWalkIn} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="wk-visitorName">Full Name <span className="text-red-500">*</span></Label>
                    <Input id="wk-visitorName" required value={formData.visitorName} onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })} placeholder="Visitor's full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wk-phone">Phone <span className="text-red-500">*</span></Label>
                    <Input id="wk-phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="09xxxxxxxx" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wk-faydaNumber">Fayda ID <span className="text-red-500">*</span></Label>
                    <Input id="wk-faydaNumber" required pattern="\d{14}" maxLength={14} value={formData.faydaNumber} onChange={(e) => setFormData({ ...formData, faydaNumber: e.target.value.replace(/\D/g, '') })} placeholder="14 digits" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wk-branch">Branch <span className="text-red-500">*</span></Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, branchId: value, departmentId: '' })} value={formData.branchId} required>
                      <SelectTrigger id="wk-branch"><SelectValue placeholder="Select branch" /></SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wk-department">Department <span className="text-red-500">*</span></Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, departmentId: value })} value={formData.departmentId} required disabled={!formData.branchId}>
                      <SelectTrigger id="wk-department"><SelectValue placeholder="Select dept" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="wk-personToMeet">Person To Meet <span className="text-neutral-400 font-normal">(optional)</span></Label>
                    <Input id="wk-personToMeet" value={formData.personToMeet} onChange={(e) => setFormData({ ...formData, personToMeet: e.target.value })} placeholder="Name of the person they are visiting" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="wk-purpose">Purpose / Reason <span className="text-red-500">*</span></Label>
                    <Textarea id="wk-purpose" required className="min-h-[70px]" value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} placeholder="Brief reason for visit" />
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">This visitor will be <strong>immediately checked in</strong> after registration (verbal approval obtained).</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                    {submitting && <Clock className="mr-2 h-4 w-4 animate-spin" />}
                    Register & Check In
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/50 shadow-none">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1 uppercase tracking-wider">Awaiting Check-in</span>
              <span className="text-4xl font-black text-amber-700 dark:text-amber-300">{expectedVisitors.length}</span>
              <span className="text-xs text-amber-500 mt-1">Approved visitors</span>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/50 shadow-none">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">Currently Inside</span>
              <span className="text-4xl font-black text-blue-700 dark:text-blue-300">{currentlyIn.length}</span>
              <span className="text-xs text-blue-500 mt-1">On premises now</span>
            </CardContent>
          </Card>
        </div>

        {/* Check-in Panel */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900 border-t-4 border-t-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-blue-600" />
              Visitor Verification
            </CardTitle>
            <CardDescription>Select search method and enter visitor identifier to check in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Method selector */}
            <div className="grid grid-cols-4 gap-2">
              {searchMethodConfig.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => { setSearchMethod(method.id); setScanInput(''); setLastResult(null); }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center ${
                      searchMethod === method.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 text-neutral-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] font-semibold leading-tight">{method.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleManualCheckIn} className="flex gap-2">
              <div className="relative flex-1">
                <activeMethod.icon className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input 
                  placeholder={activeMethod.placeholder}
                  value={scanInput}
                  onChange={(e) => { setScanInput(e.target.value); setLastResult(null); }}
                  className="pl-9 h-10 font-mono tracking-wider"
                  autoFocus
                />
              </div>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 px-6"
                disabled={!scanInput.trim() || processing}
              >
                {processing ? <Clock className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">Check In</span>
              </Button>
            </form>

            <p className="text-xs text-neutral-400">{activeMethod.hint}</p>

            {/* Result display */}
            {lastResult && (
              <div className={`flex items-start gap-3 p-4 rounded-lg border ${
                lastResult.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                {lastResult.success 
                  ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  : <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                }
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${lastResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                    {lastResult.message}
                  </p>
                  {lastResult.success && lastResult.visitor && (
                    <div className="mt-2 space-y-0.5 text-xs text-green-700 dark:text-green-300">
                      <p><strong>Department:</strong> {lastResult.visitor.department}</p>
                      <p><strong>Purpose:</strong> {lastResult.visitor.purpose}</p>
                      {lastResult.visitor.visitCode && <p><strong>Code:</strong> {lastResult.visitor.visitCode}</p>}
                    </div>
                  )}
                </div>
                <button onClick={() => setLastResult(null)} className="text-neutral-400 hover:text-neutral-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visitor Lists */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
          <Tabs defaultValue="approved">
            <CardHeader className="bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800 pb-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <TabsList className="grid grid-cols-2 w-full sm:w-[280px]">
                  <TabsTrigger value="approved" className="relative">
                    Expected
                    {expectedVisitors.length > 0 && (
                      <span className="ml-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{expectedVisitors.length}</span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="checked-in" className="relative">
                    On Premises
                    {currentlyIn.length > 0 && (
                      <span className="ml-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{currentlyIn.length}</span>
                    )}
                  </TabsTrigger>
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
                ) : expectedVisitors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <CheckCircle2 className="w-10 h-10 text-green-400 mb-3" />
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">All clear!</h3>
                    <p className="text-sm text-neutral-500 max-w-[280px]">No visitors waiting to check in.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-neutral-50/50">
                        <TableHead>Code</TableHead>
                        <TableHead>Visitor</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expectedVisitors.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-mono font-bold text-blue-600 tracking-widest text-sm">
                            {request.visitCode}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">{request.visitorName}</div>
                            <div className="text-xs text-neutral-500 mt-0.5 space-y-0.5">
                              <div>Fayda: {request.faydaNumber}</div>
                              <div>Phone: {request.phone}</div>
                              {request.personToMeet && <div className="text-blue-500">→ {request.personToMeet}</div>}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-medium">{request.departmentName}</TableCell>
                          <TableCell className="text-xs text-neutral-500 max-w-[140px] truncate">{request.purpose}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm"
                              className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-none"
                              onClick={() => handleListAction(request.id, 'in')}
                              disabled={processing}
                            >
                              <UserCheck2 className="h-3.5 w-3.5" />
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
                    <Building2 className="w-10 h-10 text-neutral-300 mb-3" />
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">No visitors on premises</h3>
                    <p className="text-sm text-neutral-500 max-w-[280px]">All visitors have checked out.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-neutral-50/50">
                        <TableHead>Code</TableHead>
                        <TableHead>Visitor</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Time In</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentlyIn.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-mono text-sm font-bold text-neutral-500 tracking-widest">
                            {request.visitCode}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">{request.visitorName}</div>
                            <div className="text-xs text-neutral-500 mt-0.5">{request.phone}</div>
                          </TableCell>
                          <TableCell className="text-sm font-medium">{request.departmentName}</TableCell>
                          <TableCell className="text-xs text-neutral-500">
                            {request.checkedInAt ? format(new Date(request.checkedInAt), 'h:mm a') : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5 border-neutral-300 shadow-none hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                              onClick={() => handleListAction(request.id, 'out')}
                              disabled={processing}
                            >
                              <LogOut className="h-3.5 w-3.5" />
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
