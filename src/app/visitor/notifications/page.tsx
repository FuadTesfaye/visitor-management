'use client';

import { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, Clock } from 'lucide-react';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Visit Request Approved',
    message: 'Your visit request to the Coffee Export department has been approved.',
    type: 'success',
    time: '2 hours ago',
    isRead: false
  },
  {
    id: '2',
    title: 'Visit Reminder',
    message: 'You have a scheduled visit tomorrow at 10:00 AM.',
    type: 'info',
    time: '5 hours ago',
    isRead: false
  },
  {
    id: '3',
    title: 'Pass Expired',
    message: 'Your pass for Human Resources has expired.',
    type: 'warning',
    time: '2 days ago',
    isRead: true
  }
];

export default function VisitorNotifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Notifications
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Stay updated on your visit requests and passes.
            </p>
          </div>
          <Button variant="outline" onClick={markAllAsRead}>Mark all as read</Button>
        </div>

        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No Notifications</h3>
                <p className="text-neutral-500">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-6 flex gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${!notification.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                  >
                    <div className="shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold ${!notification.isRead ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-700 dark:text-neutral-300'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-neutral-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {notification.time}
                        </span>
                      </div>
                      <p className={`text-sm ${!notification.isRead ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-500'}`}>
                        {notification.message}
                      </p>
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
