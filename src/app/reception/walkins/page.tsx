'use client';

import { useState, useEffect } from 'react';
import { UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RegisterWalkIn() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [locations, setLocationes] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    locationId: '',
    departmentId: '',
    hostEmployeeName: '',
    purpose: '',
    visitorName: '',
    phone: '',
    faydaId: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const [locationRes, deptRes] = await Promise.all([
        fetch('/api/locations'),
        fetch('/api/departments')
      ]);
      
      if (locationRes.ok) {
        const data = await locationRes.json();
        setLocationes(data.locations);
      }
      
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(data.departments);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredDepartments = departments.filter(d => d.locationId === formData.locationId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // For walk-in, date is today, time is now
      const today = new Date();
      const payload = {
        ...formData,
        requestedDateTime: today.toISOString()
      };

      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Walk-in visitor registered successfully');
        setSuccessCode(data.data.visitCode);
      } else {
        toast.error(data.error || 'Failed to register visitor');
      }
    } catch (e) {
      toast.error('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      locationId: '',
      departmentId: '',
      hostEmployeeName: '',
      purpose: '',
      visitorName: '',
      phone: '',
      faydaId: '',
    });
    setSuccessCode(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <UserPlus className="w-8 h-8 text-primary" />
            Register Walk-in Visitor
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Register a visitor who does not have a prior scheduled appointment.
          </p>
        </div>

        {successCode ? (
          <Card className="border-green-200 dark:border-green-900 shadow-sm bg-green-50 dark:bg-green-900/10">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-green-800 dark:text-green-300">Registration Complete</h2>
                <p className="text-green-600 dark:text-green-400 max-w-md">
                  The walk-in request has been sent to the department head for approval.
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-black/20 rounded-xl border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-600 dark:text-green-400 mb-1 font-medium">Temporary Visit Code</p>
                <p className="text-3xl font-mono font-bold tracking-wider text-green-700 dark:text-green-300">{successCode}</p>
              </div>
              <Button onClick={handleReset} variant="outline" className="mt-4 border-green-200 text-green-700 hover:bg-green-100">
                Register Another Visitor
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
            <CardHeader>
              <CardTitle>Visitor Information</CardTitle>
              <CardDescription>Enter the details of the walk-in visitor.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Visitor Name <span className="text-red-500">*</span></label>
                    <Input 
                      required
                      placeholder="Full Name"
                      value={formData.visitorName}
                      onChange={(e) => setFormData({...formData, visitorName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
                    <Input 
                      required
                      placeholder="0911..."
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fayda ID / National ID</label>
                    <Input 
                      placeholder="Optional"
                      value={formData.faydaId}
                      onChange={(e) => setFormData({...formData, faydaId: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <h3 className="font-medium mb-4">Visit Details</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location <span className="text-red-500">*</span></label>
                      <Select 
                        required
                        value={formData.locationId} 
                        onValueChange={(v) => setFormData({...formData, locationId: v, departmentId: ''})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map(b => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Department <span className="text-red-500">*</span></label>
                      <Select 
                        required
                        disabled={!formData.locationId}
                        value={formData.departmentId} 
                        onValueChange={(v) => setFormData({...formData, departmentId: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={formData.locationId ? "Select Department" : "Select Location First"} />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredDepartments.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Person To Visit <span className="text-red-500">*</span></label>
                      <Input 
                        required
                        placeholder="Host Name"
                        value={formData.hostEmployeeName}
                        onChange={(e) => setFormData({...formData, hostEmployeeName: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Purpose of Visit <span className="text-red-500">*</span></label>
                      <Input 
                        required
                        placeholder="e.g. Meeting, Delivery"
                        value={formData.purpose}
                        onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                    {isSubmitting ? 'Registering...' : 'Register Visitor'}
                    {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
