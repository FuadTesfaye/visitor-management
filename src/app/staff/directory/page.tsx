'use client';

import { useState, useEffect } from 'react';
import { Search, Users, Phone, Building2 } from 'lucide-react';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { VisitRequest } from '@/types';

export default function VisitorDirectory() {
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredVisits(visits);
    } else {
      const lower = searchTerm.toLowerCase();
      // Only keep unique visitors by Fayda or Phone (since it's a directory)
      // Actually, if we just filter the visits it's fine, but to make it a true directory, 
      // we could group by visitor. Let's just filter visits for simplicity.
      setFilteredVisits(
        visits.filter(v => 
          v.visitorName.toLowerCase().includes(lower) || 
          v.faydaNumber.toLowerCase().includes(lower) ||
          v.phone.includes(lower)
        )
      );
    }
  }, [searchTerm, visits]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/visits');
      if (res.ok) {
        const data = await res.json();
        
        // Remove duplicates to act like a directory
        const uniqueVisitors = Array.from(new Map(data.data.map((item: any) => [item.faydaNumber, item])).values()) as VisitRequest[];
        
        setVisits(uniqueVisitors);
        setFilteredVisits(uniqueVisitors);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Visitor Directory
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Search for any visitor by Name, Fayda ID, or Phone.
            </p>
          </div>
        </div>

        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-50/50 dark:bg-neutral-800/20">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
              <Input
                type="search"
                placeholder="Search Name, Fayda, or Phone..."
                className="pl-10 h-10 bg-white dark:bg-neutral-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-neutral-500">
              {filteredVisits.length} visitors found
            </div>
          </div>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-neutral-500">Loading directory...</p>
              </div>
            ) : filteredVisits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">No visitors found</h3>
                <p className="text-neutral-500">Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Visitor Name</TableHead>
                      <TableHead>Fayda ID</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Last Visited Department</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisits.map((visitor) => (
                      <TableRow key={visitor.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                              {visitor.visitorName.charAt(0)}
                            </div>
                            {visitor.visitorName}
                          </div>
                        </TableCell>
                        <TableCell className="text-neutral-600 dark:text-neutral-400 font-mono text-sm">
                          {visitor.faydaNumber}
                        </TableCell>
                        <TableCell className="text-neutral-600 dark:text-neutral-400">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {visitor.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                            <Building2 className="w-3 h-3" />
                            {visitor.departmentName}
                          </div>
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
