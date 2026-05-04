import { cookies } from 'next/headers';
import { mockProfiles, mockWorkerProfiles, mockJobs, mockMilestones, mockNotifications, mockB2BProfiles } from '../mock-data';

export function createClient() {
  const cookieStore = cookies();
  const mockAuth = cookieStore.get('mock_auth')?.value;
  const mockRole = cookieStore.get('mock_role')?.value || 'homeowner';
  
  const user = { id: `user_${mockRole}` };
  const session = mockAuth ? { user } : null;

  return {
    auth: {
      getSession: async () => ({ data: { session }, error: null }),
      getUser: async () => ({ data: { user }, error: null }),
      signOut: async () => { return { error: null }; }
    },
    from: (table: string) => {
      let resolveData: any = [];
      if (table === 'jobs') resolveData = mockJobs;
      if (table === 'milestones') resolveData = mockMilestones;
      if (table === 'profiles') resolveData = mockProfiles;
      if (table === 'worker_profiles') resolveData = mockWorkerProfiles;
      if (table === 'b2b_client_profiles') resolveData = mockB2BProfiles;
      if (table === 'notifications') resolveData = mockNotifications;

      const queryObj = {
        select: () => queryObj,
        eq: () => queryObj,
        in: () => queryObj,
        order: () => queryObj,
        limit: () => queryObj,
        insert: () => queryObj,
        update: () => queryObj,
        upsert: () => queryObj,
        delete: () => queryObj,
        single: async () => {
          if (table === 'profiles') return { data: mockProfiles.find(p => p.id === user.id) || mockProfiles[0], error: null };
          if (table === 'worker_profiles') return { data: mockWorkerProfiles[0], error: null };
          if (table === 'b2b_client_profiles') return { data: mockB2BProfiles[0], error: null };
          if (table === 'jobs') return { data: mockJobs[0], error: null };
          if (table === 'milestones') return { data: mockMilestones[0], error: null };
          return { data: resolveData[0] || null, error: null };
        },
        then: (resolve: any) => {
          resolve({ data: resolveData, error: null });
        }
      };
      return queryObj as any;
    }
  };
}

export function createServiceClient() {
  return createClient(); // Use same mock for service client
}
