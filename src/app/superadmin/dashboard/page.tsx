'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Users,
  BarChart3,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  MapPin,
  Layers,
  UserCog,
  RefreshCw,
  Shield,
  TrendingUp
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { VisitRequest, Branch, Department, User } from '@/types';
import { useLanguage } from '@/lib/language-context';

export default function SuperAdminDashboard() {
  const [requests, setRequests] = useState<VisitRequest[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Branch CRUD
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  
  // Dept CRUD
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptBranchId, setDeptBranchId] = useState('');
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptBranchFilter, setDeptBranchFilter] = useState('all');
  
  // User CRUD
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'staff', branchId: '', departmentId: '' });
  const [userDeptOptions, setUserDeptOptions] = useState<Department[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();

  useEffect(() => { fetchAll(); }, []);
  
  useEffect(() => {
    if (newUser.branchId) {
      fetchUserDepts(newUser.branchId);
    } else {
      setUserDeptOptions([]);
    }
  }, [newUser.branchId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [reqRes, branchRes, deptRes, userRes] = await Promise.all([
        fetch('/api/visits'),
        fetch('/api/branches'),
        fetch('/api/departments'),
        fetch('/api/admin/users')
      ]);
      
      if (reqRes.ok) setRequests((await reqRes.json()).data);
      if (branchRes.ok) setBranches((await branchRes.json()).branches);
      if (deptRes.ok) setDepartments((await deptRes.json()).departments);
      if (userRes.ok) setUsers((await userRes.json()).users);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDepts = async (branchId: string) => {
    try {
      const res = await fetch(`/api/departments?branchId=${branchId}`);
      if (res.ok) setUserDeptOptions((await res.json()).departments);
    } catch (e) {}
  };

  // --- Branch handlers ---
  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingBranch ? `/api/admin/branches/${editingBranch.id}` : '/api/admin/branches';
      const method = editingBranch ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: branchName })
      });
      if (res.ok) {
        toast.success(editingBranch ? 'Branch updated!' : 'Branch created!');
        setBranchName('');
        setEditingBranch(null);
        setShowBranchForm(false);
        fetchAll();
      } else {
        const d = await res.json();
        toast.error(d.error);
      }
    } catch (e) { toast.error('Network error'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteBranch = async (id: string) => {
    if (!confirm('Delete this branch? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/branches/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Branch deleted'); fetchAll(); }
      else toast.error('Failed to delete branch');
    } catch (e) { toast.error('Network error'); }
  };

  // --- Department handlers ---
  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingDept ? `/api/admin/departments/${editingDept.id}` : '/api/admin/departments';
      const method = editingDept ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: deptName, branchId: deptBranchId })
      });
      if (res.ok) {
        toast.success(editingDept ? 'Department updated!' : 'Department created!');
        setDeptName('');
        setDeptBranchId('');
        setEditingDept(null);
        setShowDeptForm(false);
        fetchAll();
      } else {
        const d = await res.json();
        toast.error(d.error);
      }
    } catch (e) { toast.error('Network error'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm('Delete this department?')) return;
    try {
      const res = await fetch(`/api/admin/departments/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Department deleted'); fetchAll(); }
      else toast.error('Failed to delete department');
    } catch (e) { toast.error('Network error'); }
  };

  // --- User handlers ---
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const d = await res.json();
      if (res.ok) {
        toast.success(`Account created for ${d.user.name}!`);
        setNewUser({ name: '', email: '', password: '', role: 'staff', branchId: '', departmentId: '' });
        setShowUserForm(false);
        fetchAll();
      } else {
        toast.error(d.error);
      }
    } catch (e) { toast.error('Network error'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Delete this user account?')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('User deleted'); fetchAll(); }
      else toast.error('Failed to delete user');
    } catch (e) { toast.error('Network error'); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1 font-semibold px-2 py-0.5"><Clock className="w-3 h-3" /> {t('pending')}</Badge>;
      case 'approved': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 font-semibold px-2 py-0.5"><CheckCircle2 className="w-3 h-3" /> {t('approved')}</Badge>;
      case 'checked-in': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 font-semibold px-2 py-0.5"><Building2 className="w-3 h-3" /> {t('checkedIn')}</Badge>;
      case 'checked-out': return <Badge variant="outline" className="bg-neutral-50 text-neutral-700 border-neutral-200 gap-1 font-semibold px-2 py-0.5"><CheckCircle2 className="w-3 h-3" /> {t('checkedOut')}</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 font-semibold px-2 py-0.5"><XCircle className="w-3 h-3" /> {t('rejected')}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      visitor: 'bg-purple-50 text-purple-700 border-purple-200',
      staff: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      head: 'bg-amber-50 text-amber-700 border-amber-200',
      security: 'bg-blue-50 text-blue-700 border-blue-200',
      superadmin: 'bg-red-50 text-red-700 border-red-200',
    };
    return <Badge variant="outline" className={`${colors[role] || ''} font-semibold capitalize text-xs`}>{t(role)}</Badge>;
  };

  const filteredRequests = requests.filter(req => {
    const matchesBranch = branchFilter === 'all' || req.branchId === branchFilter;
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesSearch = req.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.faydaNumber.includes(searchQuery) ||
                          req.visitCode?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    return matchesBranch && matchesStatus && matchesSearch;
  });

  const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || id;

  const totalVisits = filteredRequests.length;
  const pendingVisits = filteredRequests.filter(r => r.status === 'pending').length;
  const activeVisits = filteredRequests.filter(r => r.status === 'checked-in').length;
  const approvedVisits = filteredRequests.filter(r => r.status === 'approved').length;
  const completedVisits = filteredRequests.filter(r => r.status === 'checked-out').length;

  const filteredDepts = departments.filter(d => deptBranchFilter === 'all' || d.branchId === deptBranchFilter);

  return (
    <DashboardLayout>
      <Toaster richColors position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Shield className="w-8 h-8 text-red-500" />
              System Administration
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              Full control of Tracon VMS across all branches and departments.
            </p>
          </div>
          <Button variant="outline" onClick={fetchAll} disabled={loading} className="self-start">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-[600px]">
            <TabsTrigger value="overview" className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="branches" className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Branches
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Departments
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1.5">
              <UserCog className="w-3.5 h-3.5" /> Users
            </TabsTrigger>
          </TabsList>

          {/* ─── OVERVIEW TAB ─── */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { label: 'Total Visits', value: totalVisits, color: 'text-neutral-900 dark:text-neutral-100', bg: '' },
                { label: 'Pending', value: pendingVisits, color: 'text-yellow-700', bg: 'bg-yellow-50 dark:bg-yellow-900/10' },
                { label: 'Approved', value: approvedVisits, color: 'text-green-700', bg: 'bg-green-50 dark:bg-green-900/10' },
                { label: 'On Premises', value: activeVisits, color: 'text-blue-700', bg: 'bg-blue-50 dark:bg-blue-900/10' },
                { label: 'Completed', value: completedVisits, color: 'text-neutral-500', bg: '' },
              ].map(stat => (
                <Card key={stat.label} className={`shadow-none ${stat.bg}`}>
                  <CardContent className="p-4 text-center">
                    <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs font-medium text-neutral-500 mt-1">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters and Table */}
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
              <CardHeader className="bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="All Branches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {branches.map(b => (<SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="checked-in">Checked In</SelectItem>
                        <SelectItem value="checked-out">Checked Out</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative w-full md:max-w-[280px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                    <Input placeholder="Search name, dept, fayda, code..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                ) : filteredRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <Filter className="w-8 h-8 text-neutral-300 mb-3" />
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">No records found</h3>
                    <Button variant="outline" className="mt-4" onClick={() => { setBranchFilter('all'); setStatusFilter('all'); setSearchQuery(''); }}>Reset Filters</Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent bg-neutral-50/30 dark:bg-neutral-800/20">
                          <TableHead>Code</TableHead>
                          <TableHead>Visitor Info</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-mono text-xs font-bold text-blue-600">{request.visitCode || '—'}</TableCell>
                            <TableCell>
                              <div className="font-semibold text-neutral-900 dark:text-neutral-100">{request.visitorName}</div>
                              <div className="text-xs text-neutral-500 mt-1 space-y-0.5">
                                <div>Phone: {request.phone}</div>
                                <div>Fayda: {request.faydaNumber}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-primary text-sm">{getBranchName(request.branchId)}</div>
                              <div className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3" /> {request.departmentName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{format(new Date(request.requestedDateTime), 'MMM d, yyyy')}</div>
                              <div className="text-xs text-neutral-500">{format(new Date(request.requestedDateTime), 'h:mm a')}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize text-xs">{request.visitType === 'digital' ? 'Portal' : 'Walk-in'}</Badge>
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

          {/* ─── BRANCHES TAB ─── */}
          <TabsContent value="branches">
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Branches</CardTitle>
                  <CardDescription>Manage Tracon's office branches</CardDescription>
                </div>
                <Dialog open={showBranchForm} onOpenChange={(open) => { setShowBranchForm(open); if (!open) { setBranchName(''); setEditingBranch(null); } }}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Branch</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleBranchSubmit} className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label>Branch Name</Label>
                        <Input required value={branchName} onChange={e => setBranchName(e.target.value)} placeholder="e.g., Head Office (Jemo)" />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setShowBranchForm(false)}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : (editingBranch ? 'Update' : 'Create')}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-neutral-50/50">
                      <TableHead>Branch Name</TableHead>
                      <TableHead>Departments</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branches.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-10 text-neutral-500">No branches yet. Add one above.</TableCell></TableRow>
                    ) : branches.map(branch => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-semibold">{branch.name}</TableCell>
                        <TableCell className="text-sm text-neutral-500">{departments.filter(d => d.branchId === branch.id).length} departments</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setEditingBranch(branch); setBranchName(branch.name); setShowBranchForm(true); }}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteBranch(branch.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── DEPARTMENTS TAB ─── */}
          <TabsContent value="departments">
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2"><Layers className="w-5 h-5 text-primary" /> Departments</CardTitle>
                  <CardDescription>Manage departments within each branch</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={deptBranchFilter} onValueChange={setDeptBranchFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Branches" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Dialog open={showDeptForm} onOpenChange={(open) => { setShowDeptForm(open); if (!open) { setDeptName(''); setDeptBranchId(''); setEditingDept(null); } }}>
                    <DialogTrigger asChild>
                      <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Department</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingDept ? 'Edit Department' : 'Add New Department'}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleDeptSubmit} className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label>Branch</Label>
                          <Select value={deptBranchId} onValueChange={setDeptBranchId} required>
                            <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                            <SelectContent>{branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Department Name</Label>
                          <Input required value={deptName} onChange={e => setDeptName(e.target.value)} placeholder="e.g., Coffee Export" />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" type="button" onClick={() => setShowDeptForm(false)}>Cancel</Button>
                          <Button type="submit" disabled={submitting || !deptBranchId}>{submitting ? 'Saving...' : (editingDept ? 'Update' : 'Create')}</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-neutral-50/50">
                      <TableHead>Department Name</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDepts.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-10 text-neutral-500">No departments found.</TableCell></TableRow>
                    ) : filteredDepts.map(dept => (
                      <TableRow key={dept.id}>
                        <TableCell className="font-semibold">{dept.name}</TableCell>
                        <TableCell className="text-sm text-neutral-500">{getBranchName(dept.branchId)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setEditingDept(dept); setDeptName(dept.name); setDeptBranchId(dept.branchId); setShowDeptForm(true); }}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteDept(dept.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── USERS TAB ─── */}
          <TabsContent value="users">
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><UserCog className="w-5 h-5 text-primary" /> System Accounts</CardTitle>
                  <CardDescription>Create and manage staff, security, and department head accounts</CardDescription>
                </div>
                <Dialog open={showUserForm} onOpenChange={(open) => { setShowUserForm(open); if (!open) { setNewUser({ name: '', email: '', password: '', role: 'staff', branchId: '', departmentId: '' }); }}}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Create Account</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                      <DialogTitle>Create New Account</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUserSubmit} className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                          <Label>Full Name</Label>
                          <Input required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="Full name" />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>Email Address</Label>
                          <Input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="name@tracon.com" />
                        </div>
                        <div className="space-y-2">
                          <Label>Password</Label>
                          <Input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="Min 6 characters" minLength={6} />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select value={newUser.role} onValueChange={(v) => setNewUser({...newUser, role: v, departmentId: ''})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="staff">Dept Staff</SelectItem>
                              <SelectItem value="head">Dept Head</SelectItem>
                              <SelectItem value="security">Security</SelectItem>
                              <SelectItem value="visitor">Visitor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Branch</Label>
                          <Select value={newUser.branchId} onValueChange={(v) => setNewUser({...newUser, branchId: v, departmentId: ''})}>
                            <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                            <SelectContent>
                              {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        {(newUser.role === 'staff' || newUser.role === 'head') && (
                          <div className="space-y-2">
                            <Label>Department</Label>
                            <Select value={newUser.departmentId} onValueChange={(v) => setNewUser({...newUser, departmentId: v})} disabled={!newUser.branchId}>
                              <SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
                              <SelectContent>
                                {userDeptOptions.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setShowUserForm(false)}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Account'}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-neutral-50/50">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-10 text-neutral-500">No users found.</TableCell></TableRow>
                    ) : users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-semibold">{user.name}</TableCell>
                        <TableCell className="text-sm text-neutral-500">{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="text-sm text-neutral-500">{user.branchId ? getBranchName(user.branchId) : '—'}</TableCell>
                        <TableCell className="text-xs text-neutral-400">{user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '—'}</TableCell>
                        <TableCell className="text-right">
                          {user.role !== 'superadmin' && (
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
