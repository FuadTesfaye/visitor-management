'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Building2 } from 'lucide-react';
import { toast } from 'sonner';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function VisitorProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // In a real implementation, you would call an update API
    setTimeout(() => {
      toast.success('Profile updated successfully');
      setSaving(false);
    }, 1000);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Profile Settings
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Manage your account details and preferences.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
            <CardContent className="flex flex-col items-center pt-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-3xl font-bold text-primary">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h3 className="font-bold text-lg">{user?.name}</h3>
              <p className="text-neutral-500 text-sm capitalize">{user?.role}</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                      <Input id="name" defaultValue={user?.name} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                      <Input id="email" defaultValue={user?.email} disabled className="pl-10 bg-neutral-50" />
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                      <Input id="phone" placeholder="e.g. 0911..." className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="fayda">Fayda ID</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                      <Input id="fayda" placeholder="14 digit ID" className="pl-10" />
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
