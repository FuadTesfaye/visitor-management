'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, KeyRound, Mail } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Login successful! Redirecting...');
        // Redirect based on user role
        setTimeout(() => {
          switch (data.user.role) {
            case 'visitor':
              window.location.href = '/visitor/dashboard';
              break;
            case 'staff':
              window.location.href = '/staff/dashboard';
              break;
            case 'head':
              window.location.href = '/head/dashboard';
              break;
            case 'security':
              window.location.href = '/security/dashboard';
              break;
            case 'superadmin':
              window.location.href = '/superadmin/dashboard';
              break;
            default:
              toast.error('Invalid user role');
          }
        }, 500);
      } else {
        toast.error(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setTestAccount = (email: string) => {
    form.setValue('email', email);
    form.setValue('password', 'password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <div className="w-full max-w-[400px] flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="mb-4">
            <Image 
              src="/logo.png" 
              alt="Tracon Trading PLC Logo" 
              width={120} 
              height={120}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Tracon VMS
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-[280px]">
             Welcome to Tracon Trading PLC Visitor Management System.
          </p>
        </div>

        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
          <CardHeader className="pb-4">
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                          <Input 
                            placeholder="name@example.com" 
                            className="pl-9"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="pl-9"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full font-semibold" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-neutral-100 dark:border-neutral-800 py-6 bg-neutral-50/50 dark:bg-neutral-800/50">
            <div className="w-full flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Demo Accounts</span>
              <Separator className="flex-1" />
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
              {[
                { label: 'Visitor', email: 'visitor@test.com' },
                { label: 'Dept Staff', email: 'staff@test.com' },
                { label: 'Dept Head', email: 'head@test.com' },
                { label: 'Security', email: 'security@test.com' },
                { label: 'Super Admin', email: 'superadmin@test.com' }
              ].map((account) => (
                <Button
                  key={account.label}
                  variant="outline"
                  size="sm"
                  className="justify-between group border-neutral-200 hover:border-primary hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                  onClick={() => setTestAccount(account.email)}
                >
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5 py-0">
                      {account.label}
                    </Badge>
                    <span className="text-xs text-neutral-500 group-hover:text-primary transition-colors">
                      {account.email}
                    </span>
                  </span>
                  <KeyRound className="w-3 h-3 text-neutral-300 group-hover:text-primary" />
                </Button>
              ))}
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-neutral-400">
          © 2026 Tracon VMS. All rights reserved.
        </p>
      </div>
    </div>
  );
}
