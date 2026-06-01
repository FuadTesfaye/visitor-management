'use client';

import { useState, useEffect } from 'react';
import { Network, Plus, MapPin, Search, Building2 } from 'lucide-react';
import { toast } from 'sonner';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Department {
  id: string;
  name: string;
  branchId: string;
  branch?: {
    name: string;
  };
  createdAt: string;
}

interface Branch {
  id: string;
  name: string;
}

export default function SuperAdminDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({ name: '', branchId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptRes, branchRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/branches')
      ]);
      
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(data.departments);
      }
      
      if (branchRes.ok) {
        const data = await branchRes.json();
        setBranches(data.branches);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.branchId) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const data = await res.json();
        // Optimistically add branch name
        const branch = branches.find(b => b.id === formData.branchId);
        const newDept = { ...data.department, branch: { name: branch?.name || '' } };
        
        setDepartments([...departments, newDept]);
        setFormData({ name: '', branchId: '' });
        setIsDialogOpen(false);
        toast.success('Department added successfully');
      } else {
        toast.error('Failed to add department');
      }
    } catch (e) {
      toast.error('Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.branch?.name && d.branch.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Network className="w-8 h-8 text-orange-500" />
              Departments
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              Manage organizational departments across all branches.
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
                <DialogDescription>
                  Create a new department within a specific branch.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department Name</label>
                  <Input 
                    placeholder="e.g. Human Resources, IT Support"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Branch</label>
                  <Select 
                    value={formData.branchId} 
                    onValueChange={(v) => setFormData({...formData, branchId: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting || !formData.branchId || !formData.name}>
                    {isSubmitting ? 'Saving...' : 'Save Department'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <Input 
            placeholder="Search departments..." 
            className="pl-9 bg-white dark:bg-neutral-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <Network className="w-12 h-12 text-neutral-300 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No departments found</h3>
              <p className="text-neutral-500">
                {search ? 'No departments match your search.' : 'You haven\'t added any departments yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDepartments.map((dept) => (
              <Card key={dept.id} className="border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Network className="w-5 h-5 text-orange-500 shrink-0" />
                    <span className="truncate">{dept.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-neutral-500 mt-2 bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-md">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span className="truncate font-medium">{dept.branch?.name || 'Unknown Branch'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
