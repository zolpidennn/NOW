-- ============================================
-- Execute this SQL in your Supabase SQL Editor
-- ============================================

-- Step 1: Create company_admins table
CREATE TABLE IF NOT EXISTS public.company_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email VARCHAR(255) NOT NULL,
  permission_level VARCHAR(50) NOT NULL DEFAULT 'simple' CHECK (permission_level IN ('master', 'staff', 'simple')),
  is_active BOOLEAN DEFAULT true,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, user_email)
);

-- Step 2: Create indexes for company_admins
CREATE INDEX IF NOT EXISTS idx_company_admins_company_id ON public.company_admins(company_id);
CREATE INDEX IF NOT EXISTS idx_company_admins_user_id ON public.company_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_company_admins_user_email ON public.company_admins(user_email);

-- Step 3: Create company_documents table
CREATE TABLE IF NOT EXISTS public.company_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create indexes for company_documents
CREATE INDEX IF NOT EXISTS idx_company_documents_company_id ON public.company_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_company_documents_document_type ON public.company_documents(document_type);

-- Step 5: Enable RLS on both tables
ALTER TABLE public.company_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS Policies for company_admins
-- Policy 1: Users can see their own admin records
DROP POLICY IF EXISTS "Users can see their own admin records" ON public.company_admins;
CREATE POLICY "Users can see their own admin records"
  ON public.company_admins
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy 2: Company owners can see all their company's admins
DROP POLICY IF EXISTS "Company owners can see admins" ON public.company_admins;
CREATE POLICY "Company owners can see admins"
  ON public.company_admins
  FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM public.service_providers WHERE user_id = auth.uid()
    )
    OR
    -- Admin master leonardo@oliport.com.br can see all
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'leonardo@oliport.com.br'
    )
  );

-- Policy 3: Company admins can see their company's admins
DROP POLICY IF EXISTS "Company admins can see company admins" ON public.company_admins;
CREATE POLICY "Company admins can see company admins"
  ON public.company_admins
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.company_admins WHERE user_id = auth.uid()
    )
  );

-- Policy 4: Company owners can insert admins
DROP POLICY IF EXISTS "Company owners can insert admins" ON public.company_admins;
CREATE POLICY "Company owners can insert admins"
  ON public.company_admins
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      -- Company owner
      company_id IN (
        SELECT id FROM public.service_providers WHERE user_id = auth.uid()
      )
      OR
      -- Admin master leonardo@oliport.com.br
      EXISTS (
        SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'leonardo@oliport.com.br'
      )
    )
  );

-- Policy 5: Company owners can update admins
DROP POLICY IF EXISTS "Company owners can update admins" ON public.company_admins;
CREATE POLICY "Company owners can update admins"
  ON public.company_admins
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      -- Company owner
      company_id IN (
        SELECT id FROM public.service_providers WHERE user_id = auth.uid()
      )
      OR
      -- Admin master leonardo@oliport.com.br
      EXISTS (
        SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'leonardo@oliport.com.br'
      )
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      -- Company owner
      company_id IN (
        SELECT id FROM public.service_providers WHERE user_id = auth.uid()
      )
      OR
      -- Admin master leonardo@oliport.com.br
      EXISTS (
        SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'leonardo@oliport.com.br'
      )
    )
  );

-- Policy 6: Company owners can delete admins
DROP POLICY IF EXISTS "Company owners can delete admins" ON public.company_admins;
CREATE POLICY "Company owners can delete admins"
  ON public.company_admins
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND (
      -- Company owner
      company_id IN (
        SELECT id FROM public.service_providers WHERE user_id = auth.uid()
      )
      OR
      -- Admin master leonardo@oliport.com.br
      EXISTS (
        SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'leonardo@oliport.com.br'
      )
    )
  );

-- Step 7: Create RLS Policies for company_documents
-- Policy 1: Company owners can see documents
DROP POLICY IF EXISTS "Company owners can see documents" ON public.company_documents;
CREATE POLICY "Company owners can see documents"
  ON public.company_documents
  FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM public.service_providers WHERE user_id = auth.uid()
    )
  );

-- Policy 2: Company admins can see documents
DROP POLICY IF EXISTS "Company admins can see documents" ON public.company_documents;
CREATE POLICY "Company admins can see documents"
  ON public.company_documents
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.company_admins WHERE user_id = auth.uid()
    )
  );

-- Policy 3: Company owners can insert documents
DROP POLICY IF EXISTS "Company owners can insert documents" ON public.company_documents;
CREATE POLICY "Company owners can insert documents"
  ON public.company_documents
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT id FROM public.service_providers WHERE user_id = auth.uid()
    )
  );

-- Step 8: Create trigger function to update updated_at
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create triggers for updated_at
DROP TRIGGER IF EXISTS update_company_admins_updated_at ON public.company_admins;
CREATE TRIGGER update_company_admins_updated_at
  BEFORE UPDATE ON public.company_admins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_documents_updated_at ON public.company_documents;
CREATE TRIGGER update_company_documents_updated_at
  BEFORE UPDATE ON public.company_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Step 10: Create trigger to auto-populate user_id when user registers with email
DROP FUNCTION IF EXISTS public.populate_user_id_on_register() CASCADE;
CREATE OR REPLACE FUNCTION public.populate_user_id_on_register()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.company_admins
  SET user_id = NEW.id, accepted_at = CURRENT_TIMESTAMP
  WHERE LOWER(user_email) = LOWER(NEW.email) AND user_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_populate_user_id ON public.profiles;
CREATE TRIGGER trigger_populate_user_id
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.populate_user_id_on_register();

-- ============================================
-- Migration Complete!
-- ============================================
-- The company_admins and company_documents tables have been created with:
-- - Proper relationships to service_providers
-- - RLS policies for security
-- - Auto-update triggers
-- - Automatic user_id population when users register
--
-- You can now:
-- 1. Add company admins by email from the admin dashboard
-- 2. Admins with existing accounts get immediate access
-- 3. Admins without accounts get access once they register
