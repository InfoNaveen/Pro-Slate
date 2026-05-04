'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Bell, Menu, X, ChevronDown } from 'lucide-react';
import type { UserRole } from '@/types';

const PORTAL_LINKS: Record<UserRole, { label: string; href: string }> = {
  homeowner: { label: 'My Dashboard', href: '/dashboard/homeowner' },
  b2b_client: { label: 'B2B Portal', href: '/dashboard/b2b' },
  worker: { label: 'Worker Portal', href: '/dashboard/worker' },
  admin: { label: 'Admin Panel', href: '/dashboard/admin' },
  qa_inspector: { label: 'QA Panel', href: '/dashboard/admin' },
};

export default function Navbar() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', session.user.id)
          .single();
        if (data) {
          setRole(data.role as UserRole);
          setUserName(data.full_name);
        }
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1A1A2E] rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">PS</span>
            </div>
            <span className="font-bold text-[#1A1A2E] text-lg">ProSlate</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/services" className="text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Services</Link>
            <Link href="/workers" className="text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Find Workers</Link>
            <Link href="/estimate" className="text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Get Estimate</Link>
            <Link href="/estimate/b2b" className="text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors">B2B</Link>
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {role ? (
              <>
                <Link href={PORTAL_LINKS[role].href}>
                  <Button variant="ghost" size="sm">{PORTAL_LINKS[role].label}</Button>
                </Link>
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <div className="w-8 h-8 bg-[#1A1A2E] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {userName?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <button onClick={handleSignOut} className="text-xs text-[#6B7280] hover:text-[#E94560]">Sign out</button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="accent" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link href="/services" className="block text-sm text-[#6B7280] py-2">Services</Link>
          <Link href="/workers" className="block text-sm text-[#6B7280] py-2">Find Workers</Link>
          <Link href="/estimate" className="block text-sm text-[#6B7280] py-2">Get Estimate</Link>
          <Link href="/estimate/b2b" className="block text-sm text-[#6B7280] py-2">B2B</Link>
          {role ? (
            <>
              <Link href={PORTAL_LINKS[role].href} className="block text-sm font-medium text-[#1A1A2E] py-2">{PORTAL_LINKS[role].label}</Link>
              <button onClick={handleSignOut} className="block text-sm text-[#E94560] py-2">Sign Out</button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link href="/auth/login"><Button variant="outline" size="sm">Sign In</Button></Link>
              <Link href="/auth/signup"><Button variant="accent" size="sm">Get Started</Button></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
