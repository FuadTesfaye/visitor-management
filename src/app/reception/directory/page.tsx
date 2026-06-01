'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Mail, Building2, Network } from 'lucide-react';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: { name: string } | null;
  branch: { name: string } | null;
}

export default function StaffDirectory() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDirectory();
  }, []);

  const fetchDirectory = async () => {
    try {
      const res = await fetch('/api/directory');
      if (res.ok) {
        const data = await res.json();
        setStaff(data.directory);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.department?.name && s.department.name.toLowerCase().includes(search.toLowerCase())) ||
    (s.branch?.name && s.branch.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              Staff Directory
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              Contact list of all department staff and heads for quick verification.
            </p>
          </div>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <Input 
            placeholder="Search by name, email, department, or branch..." 
            className="pl-9 bg-white dark:bg-neutral-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Users className="w-12 h-12 text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No staff found</h3>
                <p className="text-neutral-500">
                  {search ? 'No staff match your search.' : 'There are no staff members in the directory.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((person) => (
                      <TableRow key={person.id}>
                        <TableCell>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">{person.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-neutral-500">
                            <Mail className="w-4 h-4" />
                            {person.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {person.branch?.name || 'Unassigned Branch'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Network className="w-3.5 h-3.5" />
                              {person.department?.name || 'Unassigned Dept'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {person.role === 'head' ? (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              Dept Head
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Staff
                            </Badge>
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
    </DashboardLayout>
  );
}
