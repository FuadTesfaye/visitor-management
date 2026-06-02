'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import logoPic from '@/../public/logo.png';
import { 
  LayoutDashboard, 
  QrCode, 
  Users, 
  LogOut, 
  Menu, 
  Bell,
  User,
  Building2,
  Settings,
  FileText,
  Calendar,
  Clock,
  UserPlus,
  CheckCircle2,
  History,
  FileBarChart,
  ScanLine,
  UserCheck,
  AlertTriangle,
  ScrollText,
  Network,
  Activity,
  LineChart,
  CalendarClock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AuthSession } from '@/types';
import { useLanguage } from '@/lib/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';

interface SidebarItem {
  titleKey: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  // EMPLOYEE (staff)
  { titleKey: 'dashboard', href: '/staff/dashboard', icon: LayoutDashboard, roles: ['staff'] },
  { titleKey: 'Create Request', href: '/staff/create', icon: UserPlus, roles: ['staff'] },
  { titleKey: 'My Requests', href: '/staff/requests', icon: FileText, roles: ['staff'] },
  { titleKey: 'Department Visitors', href: '/staff/department-visitors', icon: Users, roles: ['staff'] },
  { titleKey: 'Notifications', href: '/staff/notifications', icon: Bell, roles: ['staff'] },
  { titleKey: 'Profile', href: '/staff/profile', icon: User, roles: ['staff'] },
  
  // DEPARTMENT HEAD
  { titleKey: 'dashboard', href: '/head/dashboard', icon: LayoutDashboard, roles: ['head'] },
  { titleKey: 'Visitor Requests', href: '/head/approvals', icon: CheckCircle2, roles: ['head'] },
  { titleKey: 'Department Visitors', href: '/head/visitors', icon: Users, roles: ['head'] },
  { titleKey: 'Employees', href: '/head/employees', icon: Network, roles: ['head'] },
  { titleKey: 'Reports', href: '/head/reports', icon: FileBarChart, roles: ['head'] },
  { titleKey: 'Notifications', href: '/head/notifications', icon: Bell, roles: ['head'] },
  { titleKey: 'Profile', href: '/head/profile', icon: User, roles: ['head'] },
  
  // SECURITY
  { titleKey: 'dashboard', href: '/security/dashboard', icon: LayoutDashboard, roles: ['security'] },
  { titleKey: 'QR Scanner', href: '/security/scanner', icon: ScanLine, roles: ['security'] },
  { titleKey: 'Check-In', href: '/security/checkin', icon: UserCheck, roles: ['security'] },
  { titleKey: 'Check-Out', href: '/security/checkout', icon: LogOut, roles: ['security'] },
  { titleKey: 'Active Visitors', href: '/security/active', icon: Activity, roles: ['security'] },
  { titleKey: 'Visitor Search', href: '/security/search', icon: Users, roles: ['security'] },
  { titleKey: 'Visitor Logs', href: '/security/logs', icon: ScrollText, roles: ['security'] },
  { titleKey: 'Incident Reports', href: '/security/incidents', icon: AlertTriangle, roles: ['security'] },
  { titleKey: 'Profile', href: '/security/profile', icon: User, roles: ['security'] },
  
  // SUPER ADMIN
  { titleKey: 'dashboard', href: '/superadmin/dashboard', icon: LayoutDashboard, roles: ['superadmin'] },
  { titleKey: 'Visitor Requests', href: '/superadmin/requests', icon: Users, roles: ['superadmin'] },
  { titleKey: 'Departments', href: '/superadmin/departments', icon: Network, roles: ['superadmin'] },
  { titleKey: 'Employees', href: '/superadmin/employees', icon: Users, roles: ['superadmin'] },
  { titleKey: 'Approvals', href: '/superadmin/monitor', icon: CheckCircle2, roles: ['superadmin'] },
  { titleKey: 'Security Ops', href: '/superadmin/security', icon: AlertTriangle, roles: ['superadmin'] },
  { titleKey: 'Reports', href: '/superadmin/reports', icon: FileBarChart, roles: ['superadmin'] },
  { titleKey: 'Notifications', href: '/superadmin/notifications', icon: Bell, roles: ['superadmin'] },
  { titleKey: 'System Config', href: '/superadmin/config', icon: Settings, roles: ['superadmin'] },
  { titleKey: 'Audit Logs', href: '/superadmin/logs', icon: ScrollText, roles: ['superadmin'] },
  
  // RECEPTIONIST
  { titleKey: 'dashboard', href: '/reception/dashboard', icon: LayoutDashboard, roles: ['receptionist'] },
  { titleKey: 'Create Request', href: '/reception/create', icon: UserPlus, roles: ['receptionist'] },
  { titleKey: 'Walk-In Visitors', href: '/reception/walkins', icon: Users, roles: ['receptionist'] },
  { titleKey: 'Visitor Search', href: '/reception/search', icon: ScanLine, roles: ['receptionist'] },
  { titleKey: "Today's Visitors", href: '/reception/today', icon: Clock, roles: ['receptionist'] },
  { titleKey: 'Notifications', href: '/reception/notifications', icon: Bell, roles: ['receptionist'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredSidebarItems = sidebarItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-primary text-primary-foreground transition-transform duration-300 flex flex-col lg:static lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0 overflow-hidden">
          <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight text-white min-w-0">
            <Image 
              src={logoPic}
              alt="Logo" 
              className="object-contain shrink-0 w-auto h-8"
              priority
            />
            <span className="truncate">Tracon VMS</span>
          </Link>
        </div>

        <ScrollArea className="flex-1 px-4 py-6">
          <nav className="space-y-1">
            {filteredSidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-secondary text-primary" 
                      : "text-primary-foreground/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {t(item.titleKey)}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User Bottom Info */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-8 w-8 border border-white/20">
              <AvatarFallback className="bg-white/10 text-white text-xs flex items-center justify-center">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-white/70 truncate capitalize">
                {t(user?.role || '')}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 lg:px-8 shrink-0">
          {/* On mobile, we might just want to show the Logo or page title here since Menu is moved to bottom bar, but we'll keep the hamburger if they want the full sidebar */}
          <div className="flex items-center lg:hidden gap-3 min-w-0 flex-1">
            <Image 
              src={logoPic}
              alt="Logo" 
              className="object-contain shrink-0 w-auto h-7"
              priority
            />
            <span className="font-bold text-lg text-primary dark:text-white truncate">Tracon VMS</span>
          </div>

          <div className="hidden lg:block font-semibold text-lg text-neutral-800 dark:text-neutral-200 capitalize">
            {t(user?.role || '')} Portal
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <LanguageSwitcher />

            <Separator orientation="vertical" className="h-6" />

            <Button variant="ghost" size="icon" className="text-neutral-500">
              <Bell className="h-6 w-6" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary flex items-center justify-center text-lg">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-base font-medium leading-none">{user?.name}</p>
                    <p className="text-sm leading-none text-muted-foreground capitalize">
                      {t(user?.role || '')}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer h-12 text-base">
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 pb-24 lg:pb-8">
          <div className="mx-auto max-w-7xl h-full">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex lg:hidden items-end justify-around px-1 pb-[env(safe-area-inset-bottom)] h-16 sm:h-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
          {filteredSidebarItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors pt-2 pb-2",
                  isActive ? "text-[#68A4C4]" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300"
                )}
              >
                <item.icon className={cn("w-6 h-6 sm:w-7 sm:h-7", isActive && "fill-current/20")} />
                <span className="text-[10px] sm:text-xs font-medium truncate w-full text-center px-1">
                  {t(item.titleKey)}
                </span>
              </Link>
            );
          })}
          {/* Menu button for items that don't fit in bottom bar */}
          {filteredSidebarItems.length > 4 && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300 transition-colors pt-2 pb-2"
            >
              <Menu className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-[10px] sm:text-xs font-medium truncate w-full text-center px-1">
                More
              </span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}
