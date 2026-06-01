'use client';

import { useState } from 'react';
import { Download, FileText, Filter } from 'lucide-react';
import { toast } from 'sonner';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function HeadReports() {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    status: 'all'
  });

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // In a real application, you would send the filter parameters to an API endpoint 
    // that generates a CSV or Excel file and returns the download link.
    
    setTimeout(() => {
      setLoading(false);
      toast.success('Report generated successfully. Download starting...');
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Department Reports
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Generate and download visitor reports for your department.
          </p>
        </div>

        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Report Filters
            </CardTitle>
            <CardDescription>Select criteria for your report.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleExport} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate" 
                    type="date"
                    required
                    value={filter.startDate}
                    onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input 
                    id="endDate" 
                    type="date"
                    required
                    value={filter.endDate}
                    onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="status">Visit Status</Label>
                  <Select 
                    onValueChange={(value) => setFilter({ ...filter, status: value })}
                    value={filter.status}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="checked-in">Checked In</SelectItem>
                      <SelectItem value="checked-out">Checked Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <Button type="submit" disabled={loading} className="w-full sm:w-auto text-lg py-6 px-8">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Export Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
