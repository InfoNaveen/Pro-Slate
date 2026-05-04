import Link from 'next/link';
import { LayoutDashboard, FileText, Users, Briefcase, Bell } from 'lucide-react';

const NAV = [
  { href: '/dashboard/b2b', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/b2b/contracts', label: 'Contracts', icon: FileText },
  { href: '/dashboard/b2b/jobs', label: 'All Jobs', icon: Briefcase },
  { href: '/dashboard/b2b/workers', label: 'Worker Pool', icon: Users },
  { href: '/dashboard/b2b/notifications', label: 'Notifications', icon: Bell },
];

export default function B2BLayout({ children }: { children: React.ReactNode }) {
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
          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">B2B Client</span>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
