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
  ShieldAlert,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
import { VisitRequest, Branch } from '@/types';
import { useLanguage } from '@/lib/language-context';

export default function SuperAdminDashboard() {
  const [requests, setRequests] = useState<VisitRequest[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { t } = useLanguage();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [requestsRes, branchesRes] = await Promise.all([
        fetch('/api/visits'),
        fetch('/api/branches')
      ]);
      
      if (requestsRes.ok && branchesRes.ok) {
        const reqData = await requestsRes.json();
        const branchData = await branchesRes.json();
        
        setRequests(reqData.data);
        setBranches(branchData.branches);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
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
    const matchesBranch = branchFilter === 'all' || req.branchId === branchFilter;
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    
    const matchesSearch = req.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.faydaNumber.includes(searchQuery);
                          
    return matchesBranch && matchesStatus && matchesSearch;
  });

  const getBranchName = (id: string) => {
    return branches.find(b => b.id === id)?.name || id;
  };

  // Stats for the overview
  const totalVisits = filteredRequests.length;
  const pendingVisits = filteredRequests.filter(r => r.status === 'pending').length;
  const activeVisits = filteredRequests.filter(r => r.status === 'checked-in').length;
  const approvedVisits = filteredRequests.filter(r => r.status === 'approved').length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Company Overview
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              System-wide monitoring across all branches and departments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm border-neutral-200 dark:border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 uppercase">Total Access Requests</CardTitle>
              <Users className="h-4 w-4 text-neutral-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{totalVisits}</div>
              <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                Across {branchFilter === 'all' ? 'all branches' : 'selected branch'}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-neutral-200 dark:border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600 uppercase">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-700">{pendingVisits}</div>
              <p className="text-xs text-yellow-600/70 mt-1 flex items-center gap-1">
                Requires department head action
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-neutral-200 dark:border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-600 uppercase">Expected Visitors</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{approvedVisits}</div>
              <p className="text-xs text-green-600/70 mt-1 flex items-center gap-1">
                Approved, not yet checked in
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-neutral-200 dark:border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 uppercase">On Premises</CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{activeVisits}</div>
              <p className="text-xs text-blue-600/70 mt-1 flex items-center gap-1">
                Currently checked into facilities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
          <CardHeader className="bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="w-full sm:w-[200px]">
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-[160px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
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
              </div>
              
              <div className="relative w-full md:max-w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input 
                  placeholder="Search name, dept, fayda..."
                  className="pl-9 bg-white dark:bg-neutral-900" 
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
                <p className="text-sm text-neutral-500">Loading master records...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                  <Filter className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">No records found</h3>
                <p className="text-sm text-neutral-500 max-w-[280px]">
                  Try adjusting your filters or search query to find records.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => {
                  setBranchFilter('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent bg-neutral-50/30 dark:bg-neutral-800/20">
                      <TableHead>Location</TableHead>
                      <TableHead>Visitor Info</TableHead>
                      <TableHead>{t('date')}</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>{t('status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="font-semibold text-primary">
                            {getBranchName(request.branchId)}
                          </div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5" />
                            {request.departmentName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {request.visitorName}
                          </div>
                          <div className="text-xs text-neutral-500 mt-1 flex flex-col gap-0.5">
                            <span>Phone: {request.phone}</span>
                            <span>Fayda: {request.faydaNumber}</span>
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
                        <TableCell>
                           <Badge variant="outline" className="capitalize text-xs">
                             {request.visitType === 'digital' ? 'Portal' : 'Walk-in'}
                           </Badge>
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
      </div>
    </DashboardLayout>
  );
}
