-- ============================================================
-- NUESA UNN — Faculty of Engineering Website
-- Initial Database Schema Migration
-- ============================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. PROFILES (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'alumnus', 'electo', 'super_admin', 'staff')),
  matric_number VARCHAR(20) UNIQUE,
  graduation_year INTEGER,
  department VARCHAR(10),
  current_level VARCHAR(10) CHECK (current_level IN ('100','200','300','400','500','PG')),
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  phone VARCHAR(20),
  avatar_url TEXT,
  bio TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','active','suspended')),
  is_email_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_department ON profiles(department);
CREATE INDEX idx_profiles_matric ON profiles(matric_number);
CREATE INDEX idx_profiles_deleted ON profiles(deleted_at) WHERE deleted_at IS NULL;

-- 2. SECTIONS (versioned content blocks)
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  label VARCHAR(200) NOT NULL,
  section_type VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sections_active ON sections(is_active);

-- 3. SECTION VERSIONS (append-only — never mutated)
CREATE TABLE section_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  session_tag VARCHAR(20),        -- e.g. '2025/2026'
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  change_summary VARCHAR(500),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, version_number)
);

CREATE INDEX idx_sv_section ON section_versions(section_id, version_number DESC);
CREATE INDEX idx_sv_session ON section_versions(session_tag);
CREATE INDEX idx_sv_published ON section_versions(published) WHERE published = TRUE;

-- 4. SECTION LIVE (pointer to currently published version)
CREATE TABLE section_live (
  section_id UUID PRIMARY KEY REFERENCES sections(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES section_versions(id),
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  activated_by UUID REFERENCES profiles(id)
);

-- 5. DEPARTMENTS
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  image_url TEXT,
  head_of_department VARCHAR(200),
  hod_email VARCHAR(200),
  faculty_count INTEGER DEFAULT 0,
  student_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX idx_depts_code ON departments(code);

-- 6. REGISTRATION OTPS
CREATE TABLE registration_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matric_number VARCHAR(20) NOT NULL,
  email VARCHAR(200) NOT NULL,
  otp_hash VARCHAR(6) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  department VARCHAR(10) NOT NULL,
  level VARCHAR(10) NOT NULL,
  phone VARCHAR(20),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rotp_matric ON registration_otps(matric_number);
CREATE INDEX idx_rotp_expires ON registration_otps(expires_at);

-- 7. LOGIN OTPS (2FA)
CREATE TABLE login_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  otp_hash VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_lotp_user ON login_otps(user_id);

-- 8. ELECTIONS
CREATE TABLE elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  description TEXT,
  election_type VARCHAR(50) DEFAULT 'general',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','pending','nomination','voting','completed','cancelled')),
  nomination_start TIMESTAMPTZ NOT NULL,
  nomination_end TIMESTAMPTZ NOT NULL,
  voting_start TIMESTAMPTZ NOT NULL,
  voting_end TIMESTAMPTZ NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  results_published BOOLEAN DEFAULT FALSE,
  results_published_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_elec_status ON elections(status);

-- 9. POSITIONS (within elections)
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  max_candidates INTEGER DEFAULT 10,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pos_election ON positions(election_id);

-- 10. CANDIDATES
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  manifesto TEXT,
  photo_url TEXT,
  video_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approval_note TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(position_id, user_id)
);

CREATE INDEX idx_cand_position ON candidates(position_id);
CREATE INDEX idx_cand_status ON candidates(status);
CREATE INDEX idx_cand_user ON candidates(user_id);

-- 11. VOTES (anonymized — no direct user link)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  vote_hash VARCHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_votes_election ON votes(election_id);
CREATE INDEX idx_votes_position ON votes(position_id);
CREATE INDEX idx_votes_candidate ON votes(candidate_id);

-- 12. VOTER REGISTRY (for turnout — NOT linked to vote choice)
CREATE TABLE voter_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  has_voted BOOLEAN DEFAULT FALSE,
  vote_token_hash VARCHAR(64),
  voted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(election_id, user_id)
);

CREATE INDEX idx_vr_election ON voter_registry(election_id);
CREATE INDEX idx_vr_user ON voter_registry(user_id);

-- 13. PROJECT SPOTLIGHT
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  tagline VARCHAR(200),
  description TEXT NOT NULL,
  category VARCHAR(100),
  department VARCHAR(10),
  team_members JSONB DEFAULT '[]',
  mentor_name VARCHAR(200),
  cover_image TEXT,
  gallery JSONB DEFAULT '[]',
  video_url TEXT,
  github_url TEXT,
  demo_url TEXT,
  tech_stack JSONB DEFAULT '[]',
  sdg_tags JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted','approved','featured','archived')),
  featured_at TIMESTAMPTZ,
  upvote_count INTEGER DEFAULT 0,
  submitted_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_dept ON projects(department);

-- 13b. PROJECT UPVOTES
CREATE TABLE project_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- 13c. PROJECT COLLABORATION REQUESTS
CREATE TABLE project_collabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- 14. NEWS & EVENTS
CREATE TABLE news_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) NOT NULL CHECK (type IN ('news', 'event')),
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  content TEXT,
  excerpt VARCHAR(500),
  cover_image TEXT,
  category VARCHAR(100),
  event_date TIMESTAMPTZ,
  event_end_date TIMESTAMPTZ,
  location VARCHAR(300),
  rsvp_enabled BOOLEAN DEFAULT FALSE,
  max_attendees INTEGER,
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX idx_ne_type ON news_events(type);
CREATE INDEX idx_ne_published ON news_events(is_published);
CREATE INDEX idx_ne_slug ON news_events(slug);

-- 14b. RSVPs
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES news_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  response VARCHAR(10) NOT NULL CHECK (response IN ('yes','maybe','no')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 15. ALUMNI DIRECTORY
CREATE TABLE alumni_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  graduation_year INTEGER NOT NULL,
  degree VARCHAR(200),
  current_company VARCHAR(200),
  current_position VARCHAR(200),
  industry VARCHAR(100),
  location_city VARCHAR(100),
  location_country VARCHAR(100),
  bio TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  is_visible BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  mentorship_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  UNIQUE(user_id)
);

CREATE INDEX idx_ali_year ON alumni_directory(graduation_year);
CREATE INDEX idx_ali_featured ON alumni_directory(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_ali_industry ON alumni_directory(industry);

-- 16. JOB POSTINGS (by alumni / admin)
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  company VARCHAR(200) NOT NULL,
  location VARCHAR(200),
  description TEXT NOT NULL,
  requirements TEXT,
  application_url TEXT,
  application_email TEXT,
  posted_by UUID REFERENCES profiles(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired')),
  moderated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_jobs_status ON job_postings(status);

-- 17. NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(300) NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON notifications(user_id, is_read);

-- 18. AUDIT LOG (immutable)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_user ON audit_log(user_id);

-- 19. CONTACT / SPONSORSHIP INQUIRIES
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('contact', 'sponsorship')),
  company_name VARCHAR(200),
  contact_name VARCHAR(200) NOT NULL,
  contact_email VARCHAR(200) NOT NULL,
  contact_phone VARCHAR(20),
  tier_interest VARCHAR(50),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. REGISTRATION CODES (for Engineering gate)
CREATE TABLE registration_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  session_tag VARCHAR(20) NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES profiles(id),
  used_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rc_code ON registration_codes(code);
CREATE INDEX idx_rc_used ON registration_codes(is_used);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_events ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read any public profile, update only their own
CREATE POLICY profiles_select ON profiles FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY profiles_update ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Sections: public read, admin write
CREATE POLICY sections_select ON sections FOR SELECT
  USING (is_active = TRUE);

-- Projects: public read approved, owner read all, admin all
CREATE POLICY projects_select ON projects FOR SELECT
  USING (status IN ('approved','featured') OR submitted_by = auth.uid()
         OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','electo')));

-- ============================================================
-- SEED DATA: Engineering Departments
-- ============================================================

INSERT INTO departments (code, name, sort_order) VALUES
  ('ABE', 'Agricultural & Bioresources Engineering', 1),
  ('CVE', 'Civil Engineering', 2),
  ('EEE', 'Electrical Engineering', 3),
  ('ELE', 'Electronic Engineering', 4),
  ('MCE', 'Mechanical Engineering', 5),
  ('MME', 'Metallurgical & Materials Engineering', 6),
  ('MTE', 'Mechatronics Engineering', 7),
  ('BME', 'Biomedical Engineering', 8),
  ('PEE', 'Polymer & Textile Engineering', 9),
  ('FWT', 'Forestry & Wood Technology', 10)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- SEED DATA: Default Sections
-- ============================================================

INSERT INTO sections (slug, label, section_type, sort_order) VALUES
  ('hero-banner', 'Hero Banner', 'hero', 1),
  ('achievement-counters', 'Achievement Counters', 'counters', 2),
  ('departments-grid', 'Departments Grid', 'cards', 3),
  ('distinguished-alumni', 'Distinguished Alumni', 'alumni', 4),
  ('company-logos', 'Company Partners', 'companies', 5),
  ('sponsorship-cta', 'Sponsorship CTA', 'cta', 6),
  ('about-history', 'About History', 'text', 7),
  ('footer', 'Footer', 'footer', 8)
ON CONFLICT (slug) DO NOTHING;
