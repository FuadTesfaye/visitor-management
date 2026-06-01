'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { UserPlus, Clock } from 'lucide-react';
import { toast } from 'sonner';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Department, Branch } from '@/types';
import { useLanguage } from '@/lib/language-context';

export default function StaffOfflineWalkin() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();
  
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
    fetch('/api/branches')
      .then(res => res.json())
      .then(data => setBranches(data.branches))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (formData.branchId) {
      fetch(`/api/departments?branchId=${formData.branchId}`)
        .then(res => res.json())
        .then(data => setDepartments(data.departments))
        .catch(err => console.error(err));
    } else {
      setDepartments([]);
    }
  }, [formData.branchId]);

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
        toast.success('Walk-in visitor logged successfully!');
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

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Log Walk-in / Offline Visitor
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Register visitors who arrived without an appointment or cannot use the internet.
          </p>
        </div>

        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Visitor Details
            </CardTitle>
            <CardDescription>Fill out the required information to generate an access pass.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="visitorName">{t('name')}</Label>
                  <Input 
                    id="visitorName" 
                    required 
                    value={formData.visitorName}
                    onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                    placeholder="Guest Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input 
                    id="phone" 
                    required 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="09..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faydaNumber">{t('faydaNumber')}</Label>
                  <Input 
                    id="faydaNumber" 
                    required 
                    pattern="\d{14}"
                    maxLength={14}
                    value={formData.faydaNumber}
                    onChange={(e) => setFormData({ ...formData, faydaNumber: e.target.value.replace(/\D/g, '') })}
                    placeholder="XXXXXXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">{t('branch')}</Label>
                  <Select 
                    onValueChange={(value) => setFormData({ ...formData, branchId: value })}
                    value={formData.branchId}
                    required
                  >
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">{t('department')}</Label>
                  <Select 
                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                    value={formData.departmentId}
                    required
                    disabled={!formData.branchId}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="st-personToMeet">Person To Meet <span className="text-neutral-400 font-normal">(optional)</span></Label>
                  <Input 
                    id="st-personToMeet" 
                    value={formData.personToMeet}
                    onChange={(e) => setFormData({ ...formData, personToMeet: e.target.value })}
                    placeholder="Name of the person they are visiting"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">{t('date')}</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input 
                    id="time" 
                    type="time" 
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="purpose">{t('purpose')}</Label>
                  <Textarea 
                    id="purpose" 
                    required 
                    className="min-h-[100px]"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto text-lg py-6 px-8">
                  {submitting && <Clock className="mr-2 h-5 w-5 animate-spin" />}
                  Register & Approve Walk-in
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
