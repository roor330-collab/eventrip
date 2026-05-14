-- ═══════════════════════════════════════════════════════════════════════════════
-- Eventrip — Schéma Supabase (PostgreSQL)
--
-- INSTRUCTIONS D'INSTALLATION :
-- 1. Créer un projet Supabase : supabase.com/dashboard
-- 2. Ouvrir SQL Editor → New Query
-- 3. Copier-coller ce fichier entièrement
-- 4. Exécuter (RUN)
--
-- Tables :
--   - users                  : Profils utilisateurs
--   - events                 : Événements
--   - bookings               : Réservations complètes
--   - booking_items          : Items dans une réservation (tickets, hôtel, vol)
--   - transactions           : Historique paiements
--   - saved_packages         : Packages sauvegardés
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Extensions ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Types enum ────────────────────────────────────────────────────────────────
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE booking_item_type AS ENUM ('ticket', 'flight', 'train', 'hotel');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- ─── Table : Users ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  country VARCHAR(2),
  preferred_currency VARCHAR(3) DEFAULT 'EUR',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─── Table : Events ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(100) PRIMARY KEY,
  external_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  venue_name VARCHAR(255),
  venue_latitude DECIMAL(10, 8),
  venue_longitude DECIMAL(11, 8),
  city VARCHAR(100),
  country VARCHAR(2),
  event_date DATE NOT NULL,
  image_url TEXT,
  ticket_types JSONB,
  tags TEXT[],
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─── Table : Bookings ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  confirmation_number VARCHAR(20) NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  event_id VARCHAR(100) NOT NULL,
  event_date DATE NOT NULL,
  status booking_status DEFAULT 'pending',
  total_price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  departure_city VARCHAR(100),
  departure_date DATE,
  return_date DATE,
  passengers INT DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT
);

-- ─── Table : Booking Items ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL,
  item_type booking_item_type NOT NULL,
  external_id VARCHAR(255),
  provider VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- ─── Table : Transactions ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL,
  stripe_payment_intent_id VARCHAR(100),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status payment_status DEFAULT 'pending',
  payment_method VARCHAR(50),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- ─── Table : Saved Packages ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  event_id VARCHAR(100) NOT NULL,
  event_date DATE NOT NULL,
  package_data JSONB NOT NULL,
  name VARCHAR(255),
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- ─── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_items_booking_id ON booking_items(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_booking_id ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_saved_packages_user_id ON saved_packages(user_id);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);

-- ─── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth_id = auth.uid());

CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth_id = auth.uid());

CREATE POLICY bookings_select_own ON bookings
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY bookings_insert_own ON bookings
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY bookings_update_own ON bookings
  FOR UPDATE USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY booking_items_select_own ON booking_items
  FOR SELECT USING (booking_id IN (SELECT id FROM bookings WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())));

CREATE POLICY events_select_public ON events
  FOR SELECT USING (true);

CREATE POLICY transactions_select_own ON transactions
  FOR SELECT USING (booking_id IN (SELECT id FROM bookings WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())));

CREATE POLICY saved_packages_select_own ON saved_packages
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ─── Triggers ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER saved_packages_updated_at BEFORE UPDATE ON saved_packages FOR EACH ROW EXECUTE FUNCTION update_timestamp();
