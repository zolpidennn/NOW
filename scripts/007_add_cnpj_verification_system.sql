-- Add CNPJ and verification fields to service_providers table
ALTER TABLE public.service_providers
ADD COLUMN IF NOT EXISTS cnpj VARCHAR(18) UNIQUE,
ADD COLUMN IF NOT EXISTS razao_social TEXT,
ADD COLUMN IF NOT EXISTS nome_fantasia TEXT,
ADD COLUMN IF NOT EXISTS cnae_principal TEXT,
ADD COLUMN IF NOT EXISTS responsavel_legal_nome TEXT,
ADD COLUMN IF NOT EXISTS responsavel_legal_cpf VARCHAR(14),
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' 
  CHECK (verification_status IN ('pending', 'pending_documents', 'under_review', 'verified', 'rejected', 'suspended')),
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS cnpj_validated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cnpj_validation_data JSONB,
ADD COLUMN IF NOT EXISTS registration_ip TEXT,
ADD COLUMN IF NOT EXISTS last_login_ip TEXT,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Create table for document uploads
CREATE TABLE IF NOT EXISTS public.provider_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('contrato_social', 'documento_responsavel', 'selfie', 'comprovante_endereco', 'certificados', 'outros')),
  document_url TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for CNPJ validation attempts (rate limiting and fraud prevention)
CREATE TABLE IF NOT EXISTS public.cnpj_validation_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cnpj VARCHAR(18) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  validation_success BOOLEAN DEFAULT FALSE,
  validation_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for verification audit log
CREATE TABLE IF NOT EXISTS public.provider_verification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_provider_documents_provider ON public.provider_documents(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_documents_type ON public.provider_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_cnpj_validation_attempts_cnpj ON public.cnpj_validation_attempts(cnpj);
CREATE INDEX IF NOT EXISTS idx_cnpj_validation_attempts_ip ON public.cnpj_validation_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_cnpj_validation_attempts_created ON public.cnpj_validation_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_provider_verification_log_provider ON public.provider_verification_log(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_cnpj ON public.service_providers(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_service_providers_verification_status ON public.service_providers(verification_status);

-- Enable RLS
ALTER TABLE public.provider_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cnpj_validation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_verification_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for provider_documents
CREATE POLICY "Providers can view their own documents"
ON public.provider_documents FOR SELECT
USING (provider_id IN (SELECT id FROM public.service_providers WHERE user_id = auth.uid()));

CREATE POLICY "Providers can upload their own documents"
ON public.provider_documents FOR INSERT
WITH CHECK (provider_id IN (SELECT id FROM public.service_providers WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all documents"
ON public.provider_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (full_name = 'Admin' OR full_name ILIKE '%admin%')
  )
);

-- RLS Policies for cnpj_validation_attempts
CREATE POLICY "Users can view their own validation attempts"
ON public.cnpj_validation_attempts FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert validation attempts"
ON public.cnpj_validation_attempts FOR INSERT
WITH CHECK (user_id = auth.uid());

-- RLS Policies for provider_verification_log
CREATE POLICY "Providers can view their own verification log"
ON public.provider_verification_log FOR SELECT
USING (provider_id IN (SELECT id FROM public.service_providers WHERE user_id = auth.uid()));

-- Function to check rate limiting for CNPJ validation
CREATE OR REPLACE FUNCTION check_cnpj_validation_rate_limit(p_ip_address TEXT, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Check attempts in last hour by IP
  SELECT COUNT(*) INTO attempt_count
  FROM public.cnpj_validation_attempts
  WHERE ip_address = p_ip_address
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF attempt_count >= 10 THEN
    RETURN FALSE;
  END IF;
  
  -- Check attempts in last hour by user
  SELECT COUNT(*) INTO attempt_count
  FROM public.cnpj_validation_attempts
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF attempt_count >= 5 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if CNPJ is already registered
CREATE OR REPLACE FUNCTION is_cnpj_already_registered(p_cnpj TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  existing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_count
  FROM public.service_providers
  WHERE cnpj = p_cnpj;
  
  RETURN existing_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log verification status changes
CREATE OR REPLACE FUNCTION log_provider_verification_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
    INSERT INTO public.provider_verification_log (
      provider_id,
      old_status,
      new_status,
      changed_by,
      notes
    ) VALUES (
      NEW.id,
      OLD.verification_status,
      NEW.verification_status,
      auth.uid(),
      NEW.verification_notes
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_provider_verification_change ON public.service_providers;
CREATE TRIGGER trigger_log_provider_verification_change
  AFTER UPDATE ON public.service_providers
  FOR EACH ROW
  EXECUTE FUNCTION log_provider_verification_change();

-- Update existing RLS policy for service_providers to consider verification status
DROP POLICY IF EXISTS "Only verified providers can receive requests" ON public.service_providers;
CREATE POLICY "Only verified providers can receive requests"
ON public.service_providers FOR SELECT
USING (
  is_active = TRUE 
  AND (verification_status = 'verified' OR verification_status IS NULL)
);
