'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

const ROLE_REDIRECTS: Record<string, string> = {
  homeowner: '/dashboard/homeowner',
  b2b_client: '/dashboard/b2b',
  worker: '/dashboard/worker',
  admin: '/dashboard/admin',
  qa_inspector: '/dashboard/admin',
};

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    
    // Mock login logic based on email
    let role = 'homeowner';
    if (data.email.includes('b2b')) role = 'b2b_client';
    if (data.email.includes('worker')) role = 'worker';
    if (data.email.includes('admin')) role = 'admin';

    // Set mock cookies
    document.cookie = `mock_auth=true; path=/; max-age=86400`;
    document.cookie = `mock_role=${role}; path=/; max-age=86400`;

    // Simulate network delay
    setTimeout(() => {
      router.push(ROLE_REDIRECTS[role] ?? '/dashboard/homeowner');
      router.refresh(); // Refresh to ensure middleware catches the new cookie
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#1A1A2E] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">PS</span>
            </div>
            <span className="font-bold text-[#1A1A2E] text-xl">ProSlate</span>
          </Link>
          <p className="text-[#6B7280] mt-2 text-sm">India's Verified Surface Finishing Network</p>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">Welcome back</h1>
          <p className="text-[#6B7280] text-sm mb-6">Sign in to your ProSlate account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-[#1A1A2E]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="mt-1"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-[#1A1A2E]">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="mt-1"
                {...register('password')}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in...</> : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-[#6B7280] mt-6">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-[#E94560] font-medium hover:underline">Sign up</Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-blue-700 mb-2">Demo Credentials</p>
          <div className="space-y-1 text-xs text-blue-600">
            <p>Homeowner: homeowner1@demo.com / demo123456</p>
            <p>B2B Client: b2b1@demo.com / demo123456</p>
            <p>Worker: worker1@demo.com / demo123456</p>
            <p>Admin: admin@proslate.in / admin123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}
