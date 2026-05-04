import {
  Profile,
  B2BClientProfile,
  WorkerProfile,
  Job,
  Milestone,
  Notification,
  ServiceCategory,
} from '@/types';

export const mockProfiles: Profile[] = [
  {
    id: 'user_homeowner',
    full_name: 'Rahul Sharma',
    phone: '9876543210',
    role: 'homeowner',
    avatar_url: null,
    city: 'Bangalore',
    created_at: new Date().toISOString(),
  },
  {
    id: 'user_b2b',
    full_name: 'Prestige Group',
    phone: '9876543211',
    role: 'b2b_client',
    avatar_url: null,
    city: 'Bangalore',
    created_at: new Date().toISOString(),
  },
  {
    id: 'user_worker',
    full_name: 'Ravi Kumar',
    phone: '9876543212',
    role: 'worker',
    avatar_url: null,
    city: 'Bangalore',
    created_at: new Date().toISOString(),
  },
  {
    id: 'user_admin',
    full_name: 'System Admin',
    phone: '9876543213',
    role: 'admin',
    avatar_url: null,
    city: 'Bangalore',
    created_at: new Date().toISOString(),
  },
];

export const mockWorkerProfiles: WorkerProfile[] = [
  {
    id: 'user_worker',
    specializations: ['tile_laying', 'epoxy_grouting'],
    experience_years: 5,
    skill_score: 85,
    certified: true,
    badge: 'Expert',
    reliability_score: 90,
    total_jobs: 24,
    completion_rate: 98,
    avg_rating: 4.8,
    available: true,
    current_zone: 'Whitefield',
    portfolio_urls: [],
    bio: 'Experienced tile layer specializing in large format tiles.',
    daily_rate: 1500,
    verified_at: new Date().toISOString(),
    badge_specializations: ['tile_laying'],
  },
];

export const mockB2BProfiles: B2BClientProfile[] = [
  {
    id: 'user_b2b',
    company_name: 'Prestige Group',
    company_type: 'builder',
    gstin: '29ABCDE1234F1Z5',
    contact_person: 'Amit Patel',
    website: 'https://prestige.example.com',
    active_projects: 3,
    total_spent: 450000,
    preferred_worker_ids: ['user_worker'],
  },
];

export const mockJobs: Job[] = [
  {
    id: 'job_1',
    client_id: 'user_homeowner',
    worker_id: 'user_worker',
    client_type: 'homeowner',
    service_category: 'tile_laying',
    status: 'in_progress',
    area_sqft: 500,
    surface_type: 'tile_vitrified',
    surface_condition: 'flat',
    complexity: 'simple',
    has_pillars: false,
    pillar_count: 0,
    has_mitre_cuts: false,
    has_epoxy_grouting: true,
    floor_count: 1,
    estimated_cost: 25000,
    final_cost: null,
    quote_breakdown: null,
    site_address: '123 Main St, Whitefield',
    zone: 'Whitefield',
    site_photos: [],
    notes: 'Please ensure level matching with the living room.',
    is_b2b: false,
    project_name: null,
    expected_start_date: new Date().toISOString(),
    expected_duration_days: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockMilestones: Milestone[] = [
  {
    id: 'ms_1',
    job_id: 'job_1',
    stage: 1,
    name: 'Surface Prep',
    payment_pct: 25,
    status: 'approved',
    amount: 6250,
    photo_urls: [],
    cv_score: 95,
    cv_verdict: 'Approved',
    cv_metadata: null,
    submitted_at: new Date().toISOString(),
    approved_at: new Date().toISOString(),
    approved_by: 'system',
    admin_note: null,
  },
  {
    id: 'ms_2',
    job_id: 'job_1',
    stage: 2,
    name: 'Mid-Point Check',
    payment_pct: 25,
    status: 'pending',
    amount: 6250,
    photo_urls: [],
    cv_score: null,
    cv_verdict: null,
    cv_metadata: null,
    submitted_at: null,
    approved_at: null,
    approved_by: null,
    admin_note: null,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif_1',
    user_id: 'user_homeowner',
    title: 'Milestone Approved',
    message: 'Surface Prep milestone has been approved.',
    type: 'milestone_update',
    read: false,
    created_at: new Date().toISOString(),
  },
];

export const mockServiceCategories: ServiceCategory[] = [
  {
    id: 'sc_1',
    name: 'Tile Laying',
    slug: 'tile-laying',
    description: 'Professional installation of ceramic, vitrified, and GVT tiles.',
    icon_name: 'LayoutGrid',
    base_rate_per_sqft: 45,
    complexity_multipliers: { simple: 1.0, moderate: 1.2, complex: 1.5 },
    surface_types: ['tile_ceramic', 'tile_vitrified', 'tile_gvt'],
    active: true,
  },
];

// Helper to get current mock user from cookie string
export function getMockUser(cookieString?: string | null): Profile | null {
  if (!cookieString) return null;
  const match = cookieString.match(/mock_role=([^;]+)/);
  if (!match) return null;
  const role = match[1];
  return mockProfiles.find((p) => p.role === role) || mockProfiles[0];
}
