import Link from 'next/link';
import { LayoutDashboard, Briefcase, DollarSign, User, Shield, Bell } from 'lucide-react';

const NAV = [
  { href: '/dashboard/worker', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/worker/jobs', label: 'My Jobs', icon: Briefcase },
  { href: '/dashboard/worker/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/dashboard/worker/profile', label: 'Profile', icon: User },
  { href: '/dashboard/worker/verifications', label: 'Verifications', icon: Shield },
  { href: '/dashboard/worker/notifications', label: 'Notifications', icon: Bell },
];

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1A1A2E] rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">PS</span>
            </div>
            <span className="font-bold text-[#1A1A2E]">ProSlate</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-[#6B7280] hover:text-[#1A1A2E] hover:bg-gray-50 transition-colors">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Worker</span>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
