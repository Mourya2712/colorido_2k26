-- ============================================================
-- COLORIDO 2K26 — PostgreSQL Database Schema
-- RVR & JC College of Engineering
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Admins ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'organizer' CHECK (role IN ('super_admin', 'organizer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Event Categories ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('cultural', 'sports')),
  gender VARCHAR(10) CHECK (gender IN ('boys', 'girls', 'all')),
  description TEXT,
  icon_name VARCHAR(100),
  color_scheme VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Events ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES event_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('cultural', 'sports')),
  gender VARCHAR(10) CHECK (gender IN ('boys', 'girls', 'all')),
  subcategory VARCHAR(100),
  tagline VARCHAR(255),
  short_description TEXT,
  description TEXT,
  rules TEXT,
  eligibility TEXT,
  venue VARCHAR(255),
  venue_id VARCHAR(100),
  event_date DATE,
  start_time TIME,
  end_time TIME,
  registration_type VARCHAR(20) DEFAULT 'team' CHECK (registration_type IN ('individual', 'team', 'both')),
  min_team_size INTEGER DEFAULT 1,
  max_team_size INTEGER DEFAULT 10,
  max_registrations INTEGER,
  registration_fee INTEGER DEFAULT 0,
  registration_status VARCHAR(20) DEFAULT 'open' CHECK (registration_status IN ('open', 'closed', 'upcoming')),
  coordinator_name VARCHAR(255),
  coordinator_phone VARCHAR(20),
  coordinator_email VARCHAR(255),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Participants (individual registrants) ─────────────────────────
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  college VARCHAR(255) NOT NULL,
  gender VARCHAR(20),
  year_of_study VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Teams ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  team_name VARCHAR(255) NOT NULL,
  college VARCHAR(255) NOT NULL,
  captain_name VARCHAR(255) NOT NULL,
  captain_email VARCHAR(255) NOT NULL,
  captain_phone VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Team Members ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  college VARCHAR(255),
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('captain', 'member')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Registrations ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_number VARCHAR(20) UNIQUE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  registration_type VARCHAR(20) NOT NULL CHECK (registration_type IN ('individual', 'team')),
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
  notes TEXT,
  admin_notes TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Announcements ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'cultural', 'sports', 'registration', 'schedule', 'result')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_published BOOLEAN DEFAULT false,
  is_ticker BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Schedule ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedule_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(20) CHECK (event_type IN ('cultural', 'sports', 'ceremony', 'other')),
  gender VARCHAR(10) CHECK (gender IN ('boys', 'girls', 'all')),
  venue VARCHAR(255),
  schedule_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Results ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  event_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  position INTEGER NOT NULL CHECK (position IN (1, 2, 3)),
  winner_name VARCHAR(255) NOT NULL,
  winner_college VARCHAR(255),
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  prize VARCHAR(255),
  is_published BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Gallery ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  caption TEXT,
  image_url TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('cultural', 'sports', 'campus', 'events', 'general')),
  photographer VARCHAR(100),
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Sponsors ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  website VARCHAR(500),
  category VARCHAR(50) DEFAULT 'sponsor' CHECK (category IN ('title', 'platinum', 'gold', 'silver', 'bronze', 'sponsor', 'media')),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Site Configuration (contact, settings, etc.) ─────────────────
CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes for performance ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_gender ON events(gender);
CREATE INDEX IF NOT EXISTS idx_events_category_id ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_number ON registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_event_id ON teams(event_id);
CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedule_items(schedule_date);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
