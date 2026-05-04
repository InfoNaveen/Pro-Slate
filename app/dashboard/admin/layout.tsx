import Link from 'next/link';
import { LayoutDashboard, Briefcase, CheckSquare, Users, Shield, FileText, AlertTriangle, Lock } from 'lucide-react';

const NAV = [
  { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/admin/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/dashboard/admin/milestones', label: 'Milestones', icon: CheckSquare },
  { href: '/dashboard/admin/workers', label: 'Workers', icon: Users },
  { href: '/dashboard/admin/verifications', label: 'Verifications', icon: Shield },
  { href: '/dashboard/admin/contracts', label: 'Contracts', icon: FileText },
  { href: '/dashboard/admin/disputes', label: 'Disputes', icon: AlertTriangle },
  { href: '/dashboard/admin/escrow', label: 'Escrow', icon: Lock },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <header className="bg-[#1A1A2E] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#E94560] rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">PS</span>
            </div>
            <span className="font-bold text-white">ProSlate Admin</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            ))}
          </nav>
          <span className="text-xs bg-[#E94560] text-white px-2 py-0.5 rounded-full font-medium">Admin</span>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
