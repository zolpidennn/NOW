-- Create company_admins table for managing company users
-- This table allows adding users to a company without requiring pre-registration

CREATE TABLE IF NOT EXISTS company_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email VARCHAR(255) NOT NULL,
  permission_level VARCHAR(20) NOT NULL DEFAULT 'simple' CHECK (permission_level IN ('master', 'staff', 'simple')),
  is_active BOOLEAN DEFAULT true,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT user_id_or_email_required CHECK (user_id IS NOT NULL OR user_email IS NOT NULL),
  CONSTRAINT unique_email_per_company UNIQUE (company_id, user_email)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_admins_company_id ON company_admins(company_id);
CREATE INDEX IF NOT EXISTS idx_company_admins_user_id ON company_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_company_admins_user_email ON company_admins(user_email);

-- Enable RLS
ALTER TABLE company_admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_admins
-- Allow users to view company_admins for their company
CREATE POLICY "Company admins are viewable by company members" ON company_admins
FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM company_admins ca
    WHERE ca.company_id = company_admins.company_id
    AND ca.user_id = auth.uid()
    AND ca.is_active = true
  )
);

-- Allow company masters and admins to manage company_admins
CREATE POLICY "Company admins can be managed by masters" ON company_admins
FOR ALL
USING (
  auth.uid() IS NOT NULL AND (
    -- System admin
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND email = 'leonardo@oliport.com.br'
    )
    OR
    -- Company master
    EXISTS (
      SELECT 1 FROM company_admins ca
      WHERE ca.company_id = company_admins.company_id
      AND ca.user_id = auth.uid()
      AND ca.permission_level = 'master'
      AND ca.is_active = true
    )
  )
);

-- Trigger to auto-update user_id when a matching user registers
CREATE OR REPLACE FUNCTION update_company_admin_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new profile is created, find any pending company_admins with that email
  UPDATE company_admins
  SET user_id = NEW.id
  WHERE user_email = LOWER(NEW.email) AND user_id IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_company_admin_user_id ON profiles;

-- Create the trigger
CREATE TRIGGER trigger_update_company_admin_user_id
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_company_admin_user_id();

-- Create a function to add a user to a company
CREATE OR REPLACE FUNCTION add_user_to_company(
  p_company_id UUID,
  p_user_email VARCHAR,
  p_permission_level VARCHAR DEFAULT 'simple',
  p_invited_by UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Validate permission level
  IF p_permission_level NOT IN ('master', 'staff', 'simple') THEN
    RETURN json_build_object('error', 'Invalid permission level');
  END IF;

  -- Check if company exists
  IF NOT EXISTS (SELECT 1 FROM service_providers WHERE id = p_company_id) THEN
    RETURN json_build_object('error', 'Company not found');
  END IF;

  -- Check if user already exists in company
  IF EXISTS (SELECT 1 FROM company_admins WHERE company_id = p_company_id AND user_email = LOWER(p_user_email)) THEN
    RETURN json_build_object('error', 'User already added to this company');
  END IF;

  -- Try to find existing user by email
  SELECT id INTO v_user_id FROM profiles WHERE email = LOWER(p_user_email);

  -- Insert into company_admins
  INSERT INTO company_admins (company_id, user_id, user_email, permission_level, invited_by)
  VALUES (p_company_id, v_user_id, LOWER(p_user_email), p_permission_level, p_invited_by)
  ON CONFLICT (company_id, user_email) DO UPDATE
  SET is_active = true, updated_at = NOW()
  RETURNING row_to_json(company_admins.*) INTO v_result;

  RETURN COALESCE(v_result, json_build_object('success', true, 'user_email', p_user_email));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION add_user_to_company(UUID, VARCHAR, VARCHAR, UUID) TO authenticated;
