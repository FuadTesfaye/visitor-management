'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const formSchema = z.object({
  visitorName: z.string().min(2, 'Name must be at least 2 characters'),
  faydaNumber: z.string().length(14, 'Fayda ID must be exactly 14 digits'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  purpose: z.string().min(5, 'Purpose must be clearly stated'),
  date: z.string(),
  time: z.string(),
  // Routing logic
  unknownDepartment: z.boolean(),
  departmentId: z.string().optional(),
  hostEmployeeId: z.string().optional(),
}).refine(data => {
  if (data.unknownDepartment && !data.hostEmployeeId) return false;
  if (!data.unknownDepartment && !data.departmentId) return false;
  return true;
}, {
  message: 'You must select either a Department or a Specific Employee',
  path: ['departmentId']
});

export default function CreateRequestPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]); // Mock for now
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visitorName: '',
      faydaNumber: '',
      phone: '',
      purpose: '',
      date: '',
      time: '',
      unknownDepartment: false,
      departmentId: '',
      hostEmployeeId: '',
    },
  });

  const isUnknownDept = form.watch('unknownDepartment');

  useEffect(() => {
    // Fetch departments
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => setDepartments(data.data || []))
      .catch(console.error);
      
    // Mock fetch employees for directory
    fetch('/api/directory')
      .then(res => res.json())
      .then(data => setEmployees(data.data?.staff || []))
      .catch(console.error);
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const payload = {
        ...values,
        // Send null if empty string to avoid API errors
        departmentId: isUnknownDept ? null : values.departmentId,
        hostEmployeeId: isUnknownDept ? values.hostEmployeeId : null,
      };

      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create request');

      toast.success('Visitor request created successfully');
      router.push('/staff/requests');
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Visitor Request</CardTitle>
        <CardDescription>
          Register an incoming visitor. Routing will be automatically handled based on your selection.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="visitorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visitor Name</FormLabel>
                    <FormControl><Input placeholder="Abebe Kebede" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input placeholder="0912..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="faydaNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fayda ID Number</FormLabel>
                  <FormControl><Input placeholder="14-digit Fayda Number" maxLength={14} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 p-4 border rounded-md bg-neutral-50 dark:bg-neutral-900">
              <h3 className="font-medium text-sm">Destination Routing</h3>
              
              <FormField
                control={form.control}
                name="unknownDepartment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>I don't know the exact department</FormLabel>
                      <FormDescription>
                        Select a specific person to visit instead. The system will route it automatically.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {!isUnknownDept ? (
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department To Visit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="hostEmployeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Person To Visit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name} ({emp.position || 'Staff'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose of Visit</FormLabel>
                  <FormControl><Textarea placeholder="Reason for the visit..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">Submit Visitor Request</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
