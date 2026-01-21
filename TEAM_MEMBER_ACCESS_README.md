-- ==========================================
-- TEAM MEMBER ACCESS IMPLEMENTATION
-- ==========================================
-- This script enables team members to access service requests assigned to their company

-- 1. Add user_id column to provider_teams table
ALTER TABLE provider_teams
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Add unique constraint to prevent duplicate team members
ALTER TABLE provider_teams
ADD CONSTRAINT unique_company_user UNIQUE(company_id, user_id);

-- 3. Create RLS policies for team members to access company service requests
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Team members can view company requests" ON service_requests;
DROP POLICY IF EXISTS "Team members can update company requests" ON service_requests;
DROP POLICY IF EXISTS "Team members can view company messages" ON messages;
DROP POLICY IF EXISTS "Team members can send company messages" ON messages;
DROP POLICY IF EXISTS "Team members can update company messages" ON messages;
DROP POLICY IF EXISTS "Team members can view their own team info" ON provider_teams;

-- Create new policies
CREATE POLICY "Team members can view company requests"
  ON service_requests FOR SELECT
  USING (
    provider_id IN (
      SELECT pt.company_id
      FROM provider_teams pt
      WHERE pt.user_id = auth.uid()
      AND pt.is_active = true
    )
  );

CREATE POLICY "Team members can update company requests"
  ON service_requests FOR UPDATE
  USING (
    provider_id IN (
      SELECT pt.company_id
      FROM provider_teams pt
      WHERE pt.user_id = auth.uid()
      AND pt.is_active = true
    )
  );

CREATE POLICY "Team members can view company messages"
  ON messages FOR SELECT
  USING (
    request_id IN (
      SELECT sr.id
      FROM service_requests sr
      WHERE sr.provider_id IN (
        SELECT pt.company_id
        FROM provider_teams pt
        WHERE pt.user_id = auth.uid()
        AND pt.is_active = true
      )
    )
  );

CREATE POLICY "Team members can send company messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND request_id IN (
      SELECT sr.id
      FROM service_requests sr
      WHERE sr.provider_id IN (
        SELECT pt.company_id
        FROM provider_teams pt
        WHERE pt.user_id = auth.uid()
        AND pt.is_active = true
      )
    )
  );

CREATE POLICY "Team members can update company messages"
  ON messages FOR UPDATE
  USING (
    request_id IN (
      SELECT sr.id
      FROM service_requests sr
      WHERE sr.provider_id IN (
        SELECT pt.company_id
        FROM provider_teams pt
        WHERE pt.user_id = auth.uid()
        AND pt.is_active = true
      )
    )
  );

CREATE POLICY "Team members can view their own team info"
  ON provider_teams FOR SELECT
  USING (user_id = auth.uid());

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_provider_teams_user_id ON provider_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_teams_company_user ON provider_teams(company_id, user_id);

-- ==========================================
-- HOW TO ADD TEAM MEMBERS
-- ==========================================
-- To add a team member to a company, execute:
--
-- INSERT INTO provider_teams (
--   company_id,
--   user_id,
--   name,
--   email,
--   role,
--   is_active
-- ) VALUES (
--   'company-uuid-here',
--   'user-uuid-here',
--   'John Doe',
--   'john@company.com',
--   'technician',
--   true
-- );
--
-- The user must already exist in the auth.users table.
-- Once added, the team member can:
-- - View all service requests assigned to their company
-- - Update request status and details
-- - Send and receive messages on company requests
-- - Access the provider dashboard for their company</content>
<parameter name="filePath">c:\Users\LeoLAB\Desktop\Dados Gerais\documentos\NOW\TEAM_MEMBER_ACCESS_README.md