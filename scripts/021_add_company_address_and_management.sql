-- Add detailed address fields and company management features
-- This script adds separated address fields and company management capabilities

-- Add detailed address fields to service_providers
ALTER TABLE service_providers
ADD COLUMN IF NOT EXISTS street TEXT,
ADD COLUMN IF NOT EXISTS number TEXT,
ADD COLUMN IF NOT EXISTS complement TEXT,
ADD COLUMN IF NOT EXISTS neighborhood TEXT;

-- Update existing records to populate separated fields from address
-- This will extract components from the existing address field
UPDATE service_providers
SET
  street = CASE
    WHEN address LIKE '%,%' THEN TRIM(SPLIT_PART(address, ',', 1))
    ELSE address
  END,
  number = CASE
    WHEN address LIKE '%,%' THEN TRIM(SPLIT_PART(SPLIT_PART(address, ',', 2), '-', 1))
    ELSE ''
  END,
  complement = CASE
    WHEN address LIKE '%-%' THEN TRIM(SPLIT_PART(address, '-', 2))
    ELSE NULL
  END,
  neighborhood = CASE
    WHEN address LIKE '%-%' THEN TRIM(SPLIT_PART(SPLIT_PART(address, '-', 2), ',', 1))
    ELSE ''
  END
WHERE street IS NULL OR street = '';

-- Create company_documents table for document verification
CREATE TABLE IF NOT EXISTS company_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'cnpj_card', 'social_contract', 'proof_of_address', 'tax_certificate', 'biometric_photo'
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT
);

-- Create company_admins table for multi-user company management
CREATE TABLE IF NOT EXISTS company_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level VARCHAR(20) NOT NULL DEFAULT 'simple' CHECK (permission_level IN ('master', 'staff', 'simple')),
  is_active BOOLEAN DEFAULT true,
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure only one master per company
  CONSTRAINT unique_master_per_company UNIQUE (company_id, permission_level) DEFERRABLE INITIALLY DEFERRED
    WHERE permission_level = 'master'
);

-- Add CNPJ verification fields to service_providers
ALTER TABLE service_providers
ADD COLUMN IF NOT EXISTS cnpj_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cnpj_verification_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cnpj_verification_data JSONB;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_documents_company_id ON company_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_company_documents_type ON company_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_company_admins_company_id ON company_admins(company_id);
CREATE INDEX IF NOT EXISTS idx_company_admins_user_id ON company_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_cnpj_verified ON service_providers(cnpj_verified);

-- Enable RLS on new tables
ALTER TABLE company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_documents
CREATE POLICY "Company documents are viewable by company admins" ON company_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_admins ca
      WHERE ca.company_id = company_documents.company_id
      AND ca.user_id = auth.uid()
      AND ca.is_active = true
    ) OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

CREATE POLICY "Company documents are insertable by company admins" ON company_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_admins ca
      WHERE ca.company_id = company_documents.company_id
      AND ca.user_id = auth.uid()
      AND ca.is_active = true
      AND ca.permission_level IN ('master', 'staff')
    ) OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- RLS Policies for company_admins
CREATE POLICY "Company admins are viewable by company members" ON company_admins
  FOR SELECT USING (
    company_id IN (
      SELECT ca2.company_id FROM company_admins ca2
      WHERE ca2.user_id = auth.uid() AND ca2.is_active = true
    ) OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

CREATE POLICY "Company admins can be managed by masters and system admins" ON company_admins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM company_admins ca
      WHERE ca.company_id = company_admins.company_id
      AND ca.user_id = auth.uid()
      AND ca.permission_level = 'master'
      AND ca.is_active = true
    ) OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Function to verify CNPJ
CREATE OR REPLACE FUNCTION verify_cnpj(cnpj_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  cnpj_clean TEXT;
  weights1 INTEGER[] := ARRAY[5,4,3,2,9,8,7,6,5,4,3,2];
  weights2 INTEGER[] := ARRAY[6,5,4,3,2,9,8,7,6,5,4,3,2];
  sum1 INTEGER := 0;
  sum2 INTEGER := 0;
  digit1 INTEGER;
  digit2 INTEGER;
  i INTEGER;
BEGIN
  -- Clean CNPJ (remove non-digits)
  cnpj_clean := regexp_replace(cnpj_input, '[^0-9]', '', 'g');

  -- Check if it's 14 digits
  IF length(cnpj_clean) != 14 THEN
    RETURN FALSE;
  END IF;

  -- Check if all digits are the same
  IF cnpj_clean ~ '^(.)\1*$' THEN
    RETURN FALSE;
  END IF;

  -- Calculate first verification digit
  FOR i IN 1..12 LOOP
    sum1 := sum1 + (substring(cnpj_clean, i, 1)::INTEGER * weights1[i]);
  END LOOP;

  digit1 := CASE WHEN (sum1 % 11) < 2 THEN 0 ELSE 11 - (sum1 % 11) END;

  -- Calculate second verification digit
  FOR i IN 1..13 LOOP
    sum2 := sum2 + (substring(cnpj_clean, i, 1)::INTEGER * weights2[i]);
  END LOOP;

  digit2 := CASE WHEN (sum2 % 11) < 2 THEN 0 ELSE 11 - (sum2 % 11) END;

  -- Check if calculated digits match the input
  RETURN (digit1 = substring(cnpj_clean, 13, 1)::INTEGER) AND
         (digit2 = substring(cnpj_clean, 14, 1)::INTEGER);
END;
$$ LANGUAGE plpgsql;

-- Function to update company verification status
CREATE OR REPLACE FUNCTION update_company_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- If CNPJ is provided and valid, mark as verified
  IF NEW.cnpj IS NOT NULL AND verify_cnpj(NEW.cnpj) THEN
    NEW.cnpj_verified := TRUE;
    NEW.cnpj_verification_date := NOW();
    NEW.cnpj_verification_data := jsonb_build_object(
      'verified_at', NOW(),
      'method', 'automatic'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically verify CNPJ on insert/update
CREATE TRIGGER trigger_verify_cnpj
  BEFORE INSERT OR UPDATE ON service_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_company_verification();