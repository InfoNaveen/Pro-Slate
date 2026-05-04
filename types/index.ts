export type UserRole = 'homeowner' | 'b2b_client' | 'worker' | 'admin' | 'qa_inspector';

export type BadgeTier = 'Rookie' | 'Verified' | 'Expert' | 'Master';

export type JobStatus =
  | 'pending'
  | 'quoted'
  | 'matched'
  | 'in_progress'
  | 'milestone_review'
  | 'completed'
  | 'disputed'
  | 'cancelled';

export type MilestoneStatus = 'pending' | 'submitted' | 'approved' | 'rejected' | 'paid';

export type ContractStatus = 'draft' | 'active' | 'completed' | 'terminated';

export type SurfaceType =
  | 'tile_ceramic'
  | 'tile_gvt'
  | 'tile_vitrified'
  | 'marble'
  | 'granite'
  | 'epoxy_flooring'
  | 'waterproofing_membrane'
  | 'stone_natural';

export type SurfaceCondition = 'flat' | 'uneven' | 'debris' | 'damaged';

export type Complexity = 'simple' | 'moderate' | 'complex';

export type Specialization =
  | 'tile_laying'
  | 'large_format_tile'
  | 'marble_installation'
  | 'granite_slab'
  | 'epoxy_grouting'
  | 'waterproofing'
  | 'stone_polishing'
  | 'tile_cutting'
  | 'floor_leveling'
  | 'tile_repair'
  | 'wall_cladding'
  | 'bathroom_waterproofing';

export type BangaloreZone =
  | 'Sarjapur'
  | 'Whitefield'
  | 'North Bangalore'
  | 'Electronic City'
  | 'HSR'
  | 'JP Nagar'
  | 'Koramangala'
  | 'Indiranagar'
  | 'Hebbal';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  city: string;
  created_at: string;
}

export interface B2BClientProfile {
  id: string;
  company_name: string;
  company_type:
    | 'builder'
    | 'interior_firm'
    | 'architect'
    | 'showroom'
    | 'renovation_company'
    | 'facility_management'
    | 'commercial_fitout';
  gstin: string | null;
  contact_person: string | null;
  website: string | null;
  active_projects: number;
  total_spent: number;
  preferred_worker_ids: string[] | null;
}

export interface WorkerProfile {
  id: string;
  specializations: Specialization[];
  experience_years: number;
  skill_score: number;
  certified: boolean;
  badge: BadgeTier;
  reliability_score: number;
  total_jobs: number;
  completion_rate: number;
  avg_rating: number;
  available: boolean;
  current_zone: string | null;
  portfolio_urls: string[] | null;
  bio: string | null;
  daily_rate: number | null;
  verified_at: string | null;
  badge_specializations: string[] | null;
}

export interface WorkerWithProfile extends WorkerProfile {
  profiles: Profile;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  base_rate_per_sqft: number | null;
  complexity_multipliers: Record<string, number> | null;
  surface_types: string[] | null;
  active: boolean;
}

export interface Job {
  id: string;
  client_id: string;
  worker_id: string | null;
  client_type: 'homeowner' | 'b2b_client';
  service_category: string;
  status: JobStatus;
  area_sqft: number;
  surface_type: SurfaceType;
  surface_condition: SurfaceCondition;
  complexity: Complexity;
  has_pillars: boolean;
  pillar_count: number;
  has_mitre_cuts: boolean;
  has_epoxy_grouting: boolean;
  floor_count: number;
  estimated_cost: number | null;
  final_cost: number | null;
  quote_breakdown: QuoteBreakdown | null;
  site_address: string | null;
  zone: string | null;
  site_photos: string[] | null;
  notes: string | null;
  is_b2b: boolean;
  project_name: string | null;
  expected_start_date: string | null;
  expected_duration_days: number | null;
  created_at: string;
  updated_at: string;
}

export interface JobWithDetails extends Job {
  profiles?: Profile;
  worker_profiles?: WorkerProfile & { profiles: Profile };
  milestones?: Milestone[];
}

export interface QuoteBreakdown {
  base_cost: number;
  surface_cost: number;
  complexity_cost: number;
  pillar_cost: number;
  mitre_cost: number;
  epoxy_cost: number;
  total_cost: number;
  time_estimate_days: string;
  breakdown: string;
  recommended_specializations: string[];
}

export interface Milestone {
  id: string;
  job_id: string;
  stage: number;
  name: string;
  payment_pct: number;
  status: MilestoneStatus;
  amount: number | null;
  photo_urls: string[] | null;
  cv_score: number | null;
  cv_verdict: string | null;
  cv_metadata: CVMetadata | null;
  submitted_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  admin_note: string | null;
}

export interface CVMetadata {
  detected_objects: string[];
  alignment_score?: number;
  threshold: number;
  stage: number;
}

export interface EscrowTransaction {
  id: string;
  job_id: string;
  milestone_id: string | null;
  type: 'lock' | 'release' | 'refund';
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  mock_tx_hash: string | null;
  created_at: string;
}

export interface B2BContract {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  service_categories: string[] | null;
  worker_ids: string[] | null;
  monthly_rate: number | null;
  start_date: string | null;
  end_date: string | null;
  status: ContractStatus;
  sla_terms: string | null;
  created_at: string;
}

export interface WorkerVerification {
  id: string;
  worker_id: string;
  verification_type: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: string[] | null;
  notes: string | null;
  verified_by: string | null;
  created_at: string;
}

export interface Dispute {
  id: string;
  job_id: string;
  raised_by: string;
  reason: string;
  status: 'open' | 'under_review' | 'resolved';
  resolution: string | null;
  resolved_by: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  job_id: string;
  reviewer_id: string;
  worker_id: string;
  rating: number;
  quality_rating: number;
  punctuality_rating: number;
  comment: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string | null;
  read: boolean;
  created_at: string;
}

export interface SPEInput {
  area_sqft: number;
  surface_type: SurfaceType;
  surface_condition: SurfaceCondition;
  complexity: Complexity;
  has_pillars: boolean;
  pillar_count: number;
  has_mitre_cuts: boolean;
  has_epoxy_grouting: boolean;
}

export interface SPEOutput {
  base_cost: number;
  surface_cost: number;
  complexity_cost: number;
  pillar_cost: number;
  mitre_cost: number;
  epoxy_cost: number;
  total_cost: number;
  time_estimate_days: string;
  breakdown: string;
  recommended_specializations: string[];
}

export interface AdminStats {
  total_jobs: number;
  active_jobs: number;
  completed_jobs: number;
  total_workers: number;
  certified_workers: number;
  pending_milestones: number;
  open_disputes: number;
  total_escrow_released: number;
  total_b2b_contracts: number;
  active_b2b_contracts: number;
}
