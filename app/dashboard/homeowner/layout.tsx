import Link from 'next/link';
import { Home, Briefcase, Bell, User } from 'lucide-react';

const NAV = [
  { href: '/dashboard/homeowner', label: 'Overview', icon: Home },
  { href: '/dashboard/homeowner/jobs', label: 'My Jobs', icon: Briefcase },
  { href: '/dashboard/homeowner/notifications', label: 'Notifications', icon: Bell },
];

export default function HomeownerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Top nav */}
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B7280] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">Homeowner</span>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
