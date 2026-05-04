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
import { Loader2, Home, Building2, HardHat } from 'lucide-react';
import { cn } from '@/lib/utils';

type ClientSubType = 'homeowner' | 'b2b_client';
type UserType = 'client' | 'worker';

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  company_name: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [clientSubType, setClientSubType] = useState<ClientSubType>('homeowner');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const getRole = () => {
    if (userType === 'worker') return 'worker';
    return clientSubType;
  };

  const onSubmit = async (data: FormData) => {
    if (!userType) return;
    setLoading(true);
    setError('');

    const role = getRole();

    // Set mock cookies
    document.cookie = `mock_auth=true; path=/; max-age=86400`;
    document.cookie = `mock_role=${role}; path=/; max-age=86400`;
    
    const redirects: Record<string, string> = {
      homeowner: '/dashboard/homeowner',
      b2b_client: '/dashboard/b2b',
      worker: '/dashboard/worker',
    };

    setTimeout(() => {
      router.push(redirects[role] ?? '/dashboard/homeowner');
      router.refresh();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#1A1A2E] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">PS</span>
            </div>
            <span className="font-bold text-[#1A1A2E] text-xl">ProSlate</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">Create your account</h1>
          <p className="text-[#6B7280] text-sm mb-6">Join India's verified surface finishing network</p>

          {/* Step 1: User type */}
          {!userType && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#1A1A2E] mb-4">I want to...</p>
              <button
                onClick={() => setUserType('client')}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#E94560] hover:bg-red-50 transition-all text-left"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Home className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A2E]">Get surface finishing work done</p>
                  <p className="text-xs text-[#6B7280]">For my home or business project</p>
                </div>
              </button>
              <button
                onClick={() => setUserType('worker')}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#E94560] hover:bg-red-50 transition-all text-left"
              >
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <HardHat className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A2E]">I am a surface finishing professional</p>
                  <p className="text-xs text-[#6B7280]">Get consistent work and guaranteed payments</p>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Client sub-type */}
          {userType === 'client' && (
            <div>
              <p className="text-sm font-medium text-[#1A1A2E] mb-3">This is for...</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setClientSubType('homeowner')}
                  className={cn('p-3 border-2 rounded-lg text-sm font-medium transition-all', clientSubType === 'homeowner' ? 'border-[#E94560] bg-red-50 text-[#E94560]' : 'border-gray-200 text-[#6B7280]')}
                >
                  🏠 My Home
                </button>
                <button
                  onClick={() => setClientSubType('b2b_client')}
                  className={cn('p-3 border-2 rounded-lg text-sm font-medium transition-all', clientSubType === 'b2b_client' ? 'border-[#E94560] bg-red-50 text-[#E94560]' : 'border-gray-200 text-[#6B7280]')}
                >
                  🏢 My Business
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-[#1A1A2E]">Full Name</Label>
                  <Input placeholder="Rahul Sharma" className="mt-1" {...register('full_name')} />
                  {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
                </div>
                {clientSubType === 'b2b_client' && (
                  <div>
                    <Label className="text-sm font-medium text-[#1A1A2E]">Company Name</Label>
                    <Input placeholder="Prestige Constructions" className="mt-1" {...register('company_name')} />
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-[#1A1A2E]">Email</Label>
                  <Input type="email" placeholder="you@example.com" className="mt-1" {...register('email')} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#1A1A2E]">Phone</Label>
                  <Input type="tel" placeholder="+91 98765 43210" className="mt-1" {...register('phone')} />
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#1A1A2E]">Password</Label>
                  <Input type="password" placeholder="Min 8 characters" className="mt-1" {...register('password')} />
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                </div>
                {error && <div className="bg-red-50 border border-red-200 rounded-md p-3"><p className="text-sm text-red-600">{error}</p></div>}
                <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating account...</> : 'Create Account'}
                </Button>
                <button type="button" onClick={() => setUserType(null)} className="w-full text-sm text-[#6B7280] hover:text-[#1A1A2E]">← Back</button>
              </form>
            </div>
          )}

          {/* Worker signup */}
          {userType === 'worker' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E]">Full Name</Label>
                <Input placeholder="Ravi Kumar" className="mt-1" {...register('full_name')} />
                {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
              </div>
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E]">Email</Label>
                <Input type="email" placeholder="you@example.com" className="mt-1" {...register('email')} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E]">Phone</Label>
                <Input type="tel" placeholder="+91 98765 43210" className="mt-1" {...register('phone')} />
              </div>
              <div>
                <Label className="text-sm font-medium text-[#1A1A2E]">Password</Label>
                <Input type="password" placeholder="Min 8 characters" className="mt-1" {...register('password')} />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>
              {error && <div className="bg-red-50 border border-red-200 rounded-md p-3"><p className="text-sm text-red-600">{error}</p></div>}
              <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating account...</> : 'Join as Worker'}
              </Button>
              <button type="button" onClick={() => setUserType(null)} className="w-full text-sm text-[#6B7280] hover:text-[#1A1A2E]">← Back</button>
            </form>
          )}

          <p className="text-center text-sm text-[#6B7280] mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#E94560] font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
