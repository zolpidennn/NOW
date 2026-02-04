-- Add user_email field to company_admins to support adding users before they register
ALTER TABLE company_admins
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

-- Make user_id nullable since we can add users by email before they register
ALTER TABLE company_admins
ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint to ensure either user_id or user_email is provided
ALTER TABLE company_admins
ADD CONSTRAINT user_id_or_email_required CHECK (user_id IS NOT NULL OR user_email IS NOT NULL);

-- Create index for user_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_admins_user_email ON company_admins(user_email);

-- Add unique constraint to prevent duplicate email entries per company
ALTER TABLE company_admins
ADD CONSTRAINT unique_email_per_company UNIQUE (company_id, user_email);

-- Add trigger to auto-update user_id when a matching user registers
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

-- Backfill any existing company_admins without user_email
UPDATE company_admins ca
SET user_email = p.email
WHERE ca.user_id IS NOT NULL
  AND ca.user_email IS NULL
  AND ca.user_id = p.id
  AND p.email IS NOT NULL;
