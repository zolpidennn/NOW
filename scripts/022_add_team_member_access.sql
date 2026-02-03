-- Add user_id to provider_teams table to connect team members to real users
-- This allows team members to access service requests assigned to their company

-- Add user_id column to provider_teams
ALTER TABLE provider_teams
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add unique constraint to prevent duplicate team members
ALTER TABLE provider_teams
ADD CONSTRAINT unique_company_user UNIQUE(company_id, user_id);

-- Update RLS policies for service_requests to include team members
DROP POLICY IF EXISTS "Team members can view company requests" ON service_requests;
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

-- Allow team members to update requests assigned to their company
DROP POLICY IF EXISTS "Team members can update company requests" ON service_requests;
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

-- Allow team members to view messages from company requests
DROP POLICY IF EXISTS "Team members can view company messages" ON messages;
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

-- Allow team members to send messages on company requests
DROP POLICY IF EXISTS "Team members can send company messages" ON messages;
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

-- Allow team members to mark messages as read on company requests
DROP POLICY IF EXISTS "Team members can update company messages" ON messages;
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

-- Update provider_teams policies to allow team members to view their own info
DROP POLICY IF EXISTS "Team members can view their own team info" ON provider_teams;
CREATE POLICY "Team members can view their own team info"
  ON provider_teams FOR SELECT
  USING (user_id = auth.uid());

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_provider_teams_user_id ON provider_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_teams_company_user ON provider_teams(company_id, user_id);</content>
<parameter name="filePath">c:\Users\LeoLAB\Desktop\Dados Gerais\documentos\NOW\scripts\022_add_team_member_access.sql