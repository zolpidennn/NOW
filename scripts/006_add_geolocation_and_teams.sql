-- Add geolocation and team management features
-- This script adds the foundation for real-time tracking and company team management

-- Add geolocation fields to service providers
ALTER TABLE service_providers 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMPTZ;

-- Add geolocation to service requests
ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS customer_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS customer_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS estimated_arrival TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS actual_arrival TIMESTAMPTZ;

-- Create provider_teams table for company team management
CREATE TABLE IF NOT EXISTS provider_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'technician', -- technician, manager, admin
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_online BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create geo_locations table for tracking history
CREATE TABLE IF NOT EXISTS geo_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES provider_teams(id) ON DELETE CASCADE,
  service_request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wallets table for financial management
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID UNIQUE NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  balance DECIMAL(12, 2) DEFAULT 0.00,
  pending_balance DECIMAL(12, 2) DEFAULT 0.00,
  total_earned DECIMAL(12, 2) DEFAULT 0.00,
  total_withdrawn DECIMAL(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table for financial tracking
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  service_request_id UUID REFERENCES service_requests(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- payment, withdrawal, fee, refund
  amount DECIMAL(12, 2) NOT NULL,
  platform_fee DECIMAL(12, 2) DEFAULT 0.00,
  net_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create disputes table for conflict resolution
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL, -- user_id
  raised_against UUID NOT NULL, -- provider_id
  reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open', -- open, investigating, resolved, closed
  resolution TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create promotions table for marketing features
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percentage DECIMAL(5, 2),
  discount_amount DECIMAL(10, 2),
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_providers_location ON service_providers(latitude, longitude) WHERE is_online = true;
CREATE INDEX IF NOT EXISTS idx_teams_location ON provider_teams(latitude, longitude) WHERE is_online = true;
CREATE INDEX IF NOT EXISTS idx_geo_locations_provider ON geo_locations(provider_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disputes_request ON disputes(service_request_id);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(provider_id, is_active, start_date, end_date);

-- Create function to calculate distance between two points (in km)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL, lon1 DECIMAL,
  lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  R DECIMAL := 6371; -- Earth radius in km
  dLat DECIMAL;
  dLon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dLat := radians(lat2 - lat1);
  dLon := radians(lon2 - lon1);
  a := sin(dLat/2) * sin(dLat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dLon/2) * sin(dLon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Enable Row Level Security
ALTER TABLE provider_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic ones - adjust based on your auth setup)
CREATE POLICY "Providers can manage their own teams"
  ON provider_teams
  FOR ALL
  USING (company_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view active team members"
  ON provider_teams
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Providers can view their own wallet"
  ON wallets
  FOR SELECT
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

CREATE POLICY "Providers can view their own transactions"
  ON transactions
  FOR SELECT
  USING (wallet_id IN (SELECT id FROM wallets WHERE provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid())));
