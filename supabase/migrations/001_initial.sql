-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT CHECK (role IN ('homeowner','b2b_client','worker','admin','qa_inspector')),
  avatar_url TEXT,
  city TEXT DEFAULT 'Bengaluru',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- B2B CLIENT PROFILES
-- ============================================================
CREATE TABLE b2b_client_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_type TEXT CHECK (company_type IN ('builder','interior_firm','architect','showroom','renovation_company','facility_management','commercial_fitout')),
  gstin TEXT,
  contact_person TEXT,
  website TEXT,
  active_projects INT DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  preferred_worker_ids UUID[]
);

-- ============================================================
-- WORKER PROFILES
-- ============================================================
CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specializations TEXT[] NOT NULL DEFAULT '{}',
  experience_years INT DEFAULT 0,
  skill_score NUMERIC DEFAULT 0,
  certified BOOLEAN DEFAULT FALSE,
  badge TEXT DEFAULT 'Rookie',
  reliability_score NUMERIC DEFAULT 0,
  total_jobs INT DEFAULT 0,
  completion_rate NUMERIC DEFAULT 0,
  avg_rating NUMERIC DEFAULT 0,
  available BOOLEAN DEFAULT TRUE,
  current_zone TEXT,
  portfolio_urls TEXT[],
  bio TEXT,
  daily_rate NUMERIC,
  verified_at TIMESTAMPTZ,
  badge_specializations TEXT[]
);

-- ============================================================
-- SERVICE CATEGORIES
-- ============================================================
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_name TEXT,
  base_rate_per_sqft NUMERIC,
  complexity_multipliers JSONB,
  surface_types TEXT[],
  active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- JOBS
-- ============================================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id),
  worker_id UUID REFERENCES profiles(id),
  client_type TEXT CHECK (client_type IN ('homeowner','b2b_client')),
  service_category TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','quoted','matched','in_progress','milestone_review','completed','disputed','cancelled')),
  -- APE inputs
  area_sqft NUMERIC NOT NULL,
  surface_type TEXT NOT NULL,
  surface_condition TEXT NOT NULL,
  complexity TEXT NOT NULL,
  has_pillars BOOLEAN DEFAULT FALSE,
  pillar_count INT DEFAULT 0,
  has_mitre_cuts BOOLEAN DEFAULT FALSE,
  has_epoxy_grouting BOOLEAN DEFAULT FALSE,
  floor_count INT DEFAULT 1,
  -- APE outputs
  estimated_cost NUMERIC,
  final_cost NUMERIC,
  quote_breakdown JSONB,
  -- job metadata
  site_address TEXT,
  zone TEXT,
  site_photos TEXT[],
  notes TEXT,
  -- B2B specific
  is_b2b BOOLEAN DEFAULT FALSE,
  project_name TEXT,
  expected_start_date DATE,
  expected_duration_days INT,
  -- timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MILESTONES
-- ============================================================
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  stage INT NOT NULL,
  name TEXT NOT NULL,
  payment_pct NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','submitted','approved','rejected','paid')),
  amount NUMERIC,
  photo_urls TEXT[],
  cv_score NUMERIC,
  cv_verdict TEXT,
  cv_metadata JSONB,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  admin_note TEXT
);

-- ============================================================
-- ESCROW TRANSACTIONS
-- ============================================================
CREATE TABLE escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  milestone_id UUID REFERENCES milestones(id),
  type TEXT CHECK (type IN ('lock','release','refund')),
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','failed')),
  mock_tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- B2B CONTRACTS
-- ============================================================
CREATE TABLE b2b_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  service_categories TEXT[],
  worker_ids UUID[],
  monthly_rate NUMERIC,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','completed','terminated')),
  sla_terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WORKER VERIFICATIONS
-- ============================================================
CREATE TABLE worker_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES profiles(id),
  verification_type TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  documents TEXT[],
  notes TEXT,
  verified_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DISPUTES
-- ============================================================
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  raised_by UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','under_review','resolved')),
  resolution TEXT,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  reviewer_id UUID REFERENCES profiles(id),
  worker_id UUID REFERENCES profiles(id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  quality_rating INT CHECK (quality_rating BETWEEN 1 AND 5),
  punctuality_rating INT CHECK (punctuality_rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_worker_id ON jobs(worker_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_milestones_job_id ON milestones(job_id);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_reviews_worker_id ON reviews(worker_id);
CREATE INDEX idx_escrow_job_id ON escrow_transactions(job_id);
CREATE INDEX idx_worker_profiles_available ON worker_profiles(available);
CREATE INDEX idx_worker_profiles_badge ON worker_profiles(badge);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES — profiles
-- ============================================================
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin full access profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Public can view worker profiles" ON profiles
  FOR SELECT USING (role = 'worker');

-- ============================================================
-- RLS POLICIES — worker_profiles
-- ============================================================
CREATE POLICY "Public can view worker profiles" ON worker_profiles
  FOR SELECT USING (true);

CREATE POLICY "Workers can update own profile" ON worker_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Workers can insert own profile" ON worker_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin full access worker_profiles" ON worker_profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- RLS POLICIES — b2b_client_profiles
-- ============================================================
CREATE POLICY "B2B clients can view own profile" ON b2b_client_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "B2B clients can update own profile" ON b2b_client_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "B2B clients can insert own profile" ON b2b_client_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin full access b2b_profiles" ON b2b_client_profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- RLS POLICIES — service_categories
-- ============================================================
CREATE POLICY "Anyone can view service categories" ON service_categories
  FOR SELECT USING (active = true);

CREATE POLICY "Admin can manage service categories" ON service_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- RLS POLICIES — jobs
-- ============================================================
CREATE POLICY "Clients see own jobs" ON jobs
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Workers see assigned jobs" ON jobs
  FOR SELECT USING (auth.uid() = worker_id);

CREATE POLICY "Clients can create jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Workers can update assigned jobs" ON jobs
  FOR UPDATE USING (auth.uid() = worker_id);

CREATE POLICY "Admin full access jobs" ON jobs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- RLS POLICIES — milestones
-- ============================================================
CREATE POLICY "Job participants can view milestones" ON milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = milestones.job_id
      AND (j.client_id = auth.uid() OR j.worker_id = auth.uid())
    )
  );

CREATE POLICY "Workers can update milestones" ON milestones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = milestones.job_id AND j.worker_id = auth.uid()
    )
  );

CREATE POLICY "Admin full access milestones" ON milestones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- RLS POLICIES — escrow_transactions
-- ============================================================
CREATE POLICY "Job participants can view escrow" ON escrow_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = escrow_transactions.job_id
      AND (j.client_id = auth.uid() OR j.worker_id = auth.uid())
    )
  );

CREATE POLICY "Admin full access escrow" ON escrow_transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- RLS POLICIES — b2b_contracts
-- ============================================================
CREATE POLICY "B2B clients see own contracts" ON b2b_contracts
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "B2B clients can create contracts" ON b2b_contracts
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "B2B clients can update own contracts" ON b2b_contracts
  FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Admin full access contracts" ON b2b_contracts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- RLS POLICIES — worker_verifications
-- ============================================================
CREATE POLICY "Workers see own verifications" ON worker_verifications
  FOR SELECT USING (auth.uid() = worker_id);

CREATE POLICY "Workers can create verifications" ON worker_verifications
  FOR INSERT WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Admin full access verifications" ON worker_verifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- RLS POLICIES — disputes
-- ============================================================
CREATE POLICY "Job participants can view disputes" ON disputes
  FOR SELECT USING (
    auth.uid() = raised_by OR
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = disputes.job_id
      AND (j.client_id = auth.uid() OR j.worker_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can create disputes" ON disputes
  FOR INSERT WITH CHECK (auth.uid() = raised_by);

CREATE POLICY "Admin full access disputes" ON disputes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- RLS POLICIES — reviews
-- ============================================================
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Admin full access reviews" ON reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- RLS POLICIES — notifications
-- ============================================================
CREATE POLICY "Users see own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin full access notifications" ON notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- TRIGGER: auto-update updated_at on jobs
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'homeowner')
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
