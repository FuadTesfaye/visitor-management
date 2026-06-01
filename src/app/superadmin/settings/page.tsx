'use client';

import { useState } from 'react';
import { Settings, Save, Shield, Bell, Lock } from 'lucide-react';
import { toast } from 'sonner';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SuperAdminSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'Tracon Trading',
    supportEmail: 'support@tracon.com',
    maxPassValidity: '24', // hours
    requireIdForEntry: true,
  });

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success('System settings updated successfully');
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Settings className="w-8 h-8 text-neutral-700" />
              System Settings
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              Configure global system parameters and preferences.
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="grid gap-6">
          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2Icon className="w-5 h-5 text-neutral-500" />
                General Organization Settings
              </CardTitle>
              <CardDescription>
                Basic details about the organization running the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization Name</label>
                  <Input 
                    value={settings.companyName}
                    onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Support Email</label>
                  <Input 
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-neutral-500" />
                Security & Access Policy
              </CardTitle>
              <CardDescription>
                Configure security parameters and gate access rules.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default QR Pass Validity (Hours)</label>
                  <Input 
                    type="number"
                    min="1"
                    max="72"
                    value={settings.maxPassValidity}
                    onChange={(e) => setSettings({...settings, maxPassValidity: e.target.value})}
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer p-2 border border-neutral-200 dark:border-neutral-800 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-primary rounded border-neutral-300"
                      checked={settings.requireIdForEntry}
                      onChange={(e) => setSettings({...settings, requireIdForEntry: e.target.checked})}
                    />
                    <span className="text-sm font-medium select-none">Require Physical ID verification at Gate</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm border-red-200 dark:border-red-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
                <Lock className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Critical system actions that can affect data integrity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 border border-red-100 dark:border-red-900/30 rounded-lg bg-red-50 dark:bg-red-950/20">
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Purge Audit Logs</h4>
                  <p className="text-sm text-neutral-500">Permanently delete audit logs older than 90 days.</p>
                </div>
                <Button variant="destructive" size="sm">Purge Logs</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Building2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  )
}
