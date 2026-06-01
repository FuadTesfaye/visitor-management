'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { VisitRequest } from '@/types';

export default function HeadCalendar() {
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const res = await fetch('/api/visits');
      if (res.ok) {
        const data = await res.json();
        // Show approved, checked-in, checked-out
        setVisits(data.data.filter((r: VisitRequest) => 
          ['approved', 'checked-in', 'checked-out'].includes(r.status)
        ));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Department Calendar
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            View upcoming and past approved visits for your department.
          </p>
        </div>

        <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : visits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <CalendarIcon className="w-12 h-12 text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No scheduled visits</h3>
                <p className="text-neutral-500">There are no approved visits to display.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {visits
                  .sort((a, b) => new Date(a.requestedDateTime).getTime() - new Date(b.requestedDateTime).getTime())
                  .map((visit) => (
                  <div key={visit.id} className="flex gap-4 items-start p-4 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary/10 rounded-lg shrink-0">
                      <span className="text-sm font-bold text-primary">{format(new Date(visit.requestedDateTime), 'MMM')}</span>
                      <span className="text-xl font-black text-primary">{format(new Date(visit.requestedDateTime), 'd')}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-lg">{visit.visitorName}</h4>
                        <span className="text-sm font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full capitalize">
                          {visit.status.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">{visit.purpose}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(visit.requestedDateTime), 'h:mm a')}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">
                          {visit.visitCode}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
