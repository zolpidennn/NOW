-- Add provider_type and PF-specific fields to service_providers table
ALTER TABLE public.service_providers
ADD COLUMN IF NOT EXISTS provider_type TEXT DEFAULT 'PF' CHECK (provider_type IN ('PF', 'PJ')),
ADD COLUMN IF NOT EXISTS cpf VARCHAR(14) UNIQUE,
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS rg TEXT,
ADD COLUMN IF NOT EXISTS areas_atuacao TEXT[],
ADD COLUMN IF NOT EXISTS experiencia TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS selfie_url TEXT,
ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS identity_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS identity_verification_method TEXT CHECK (identity_verification_method IN ('document_selfie', 'whatsapp_otp', 'manual')),
ADD COLUMN IF NOT EXISTS prioritize_in_search BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS visibility_score INTEGER DEFAULT 50 CHECK (visibility_score >= 0 AND visibility_score <= 100);

-- Update verification status to include PF-specific statuses
ALTER TABLE public.service_providers
DROP CONSTRAINT IF EXISTS service_providers_verification_status_check;

ALTER TABLE public.service_providers
ADD CONSTRAINT service_providers_verification_status_check
CHECK (verification_status IN ('pending', 'pending_profile', 'pending_documents', 'pending_identity', 'under_review', 'verified', 'rejected', 'suspended'));

-- Create CPF validation attempts table (similar to CNPJ)
CREATE TABLE IF NOT EXISTS public.cpf_validation_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cpf VARCHAR(14) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  validation_success BOOLEAN DEFAULT FALSE,
  validation_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Update provider_documents to include PF-specific document types
ALTER TABLE public.provider_documents
DROP CONSTRAINT IF EXISTS provider_documents_document_type_check;

ALTER TABLE public.provider_documents
ADD CONSTRAINT provider_documents_document_type_check
CHECK (document_type IN ('contrato_social', 'documento_responsavel', 'selfie', 'comprovante_endereco', 'certificados', 'rg', 'cnh', 'selfie_com_documento', 'outros'));

-- Create table for anti-fraud tracking
CREATE TABLE IF NOT EXISTS public.provider_fraud_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cpf VARCHAR(14),
  cnpj VARCHAR(18),
  ip_address TEXT,
  device_fingerprint TEXT,
  suspicious_activity TEXT,
  blocked BOOLEAN DEFAULT FALSE,
  blocked_reason TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_providers_provider_type ON public.service_providers(provider_type);
CREATE INDEX IF NOT EXISTS idx_service_providers_cpf ON public.service_providers(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_service_providers_prioritize ON public.service_providers(prioritize_in_search) WHERE prioritize_in_search = TRUE;
CREATE INDEX IF NOT EXISTS idx_service_providers_visibility ON public.service_providers(visibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_cpf_validation_attempts_cpf ON public.cpf_validation_attempts(cpf);
CREATE INDEX IF NOT EXISTS idx_cpf_validation_attempts_ip ON public.cpf_validation_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_cpf_validation_attempts_created ON public.cpf_validation_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_provider_fraud_tracking_user ON public.provider_fraud_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_fraud_tracking_cpf ON public.provider_fraud_tracking(cpf);

-- Enable RLS
ALTER TABLE public.cpf_validation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_fraud_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cpf_validation_attempts
CREATE POLICY "Users can view their own CPF validation attempts"
ON public.cpf_validation_attempts FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert CPF validation attempts"
ON public.cpf_validation_attempts FOR INSERT
WITH CHECK (user_id = auth.uid());

-- RLS Policies for provider_fraud_tracking
CREATE POLICY "Admins can view fraud tracking"
ON public.provider_fraud_tracking FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (full_name = 'Admin' OR full_name ILIKE '%admin%')
  )
);

-- Function to check if CPF is already registered
CREATE OR REPLACE FUNCTION is_cpf_already_registered(p_cpf TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  existing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_count
  FROM public.service_providers
  WHERE cpf = p_cpf;
  
  RETURN existing_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check rate limiting for CPF validation
CREATE OR REPLACE FUNCTION check_cpf_validation_rate_limit(p_ip_address TEXT, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Check attempts in last hour by IP (stricter for PF)
  SELECT COUNT(*) INTO attempt_count
  FROM public.cpf_validation_attempts
  WHERE ip_address = p_ip_address
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF attempt_count >= 5 THEN
    RETURN FALSE;
  END IF;
  
  -- Check attempts in last hour by user
  SELECT COUNT(*) INTO attempt_count
  FROM public.cpf_validation_attempts
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF attempt_count >= 3 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate visibility score based on provider type and verification
CREATE OR REPLACE FUNCTION calculate_visibility_score(
  p_provider_type TEXT,
  p_verification_status TEXT,
  p_identity_verified BOOLEAN
)
RETURNS INTEGER AS $$
BEGIN
  -- Base score
  DECLARE
    score INTEGER := 50;
  BEGIN
    -- PJ gets priority
    IF p_provider_type = 'PJ' THEN
      score := score + 30;
    END IF;
    
    -- Verified status bonus
    IF p_verification_status = 'verified' THEN
      score := score + 20;
    END IF;
    
    -- Identity verification bonus
    IF p_identity_verified = TRUE THEN
      score := score + 10;
    END IF;
    
    -- Cap at 100
    IF score > 100 THEN
      score := 100;
    END IF;
    
    RETURN score;
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to automatically set prioritize_in_search and visibility_score
CREATE OR REPLACE FUNCTION update_provider_priority()
RETURNS TRIGGER AS $$
BEGIN
  -- PJ with verified status gets priority
  NEW.prioritize_in_search := (
    NEW.provider_type = 'PJ' AND 
    NEW.verification_status = 'verified'
  );
  
  -- Calculate visibility score
  NEW.visibility_score := calculate_visibility_score(
    NEW.provider_type,
    NEW.verification_status,
    NEW.identity_verified
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_provider_priority ON public.service_providers;
CREATE TRIGGER trigger_update_provider_priority
  BEFORE INSERT OR UPDATE ON public.service_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_priority();

-- Update existing providers to have default values
UPDATE public.service_providers
SET 
  provider_type = 'PJ',
  visibility_score = 80,
  prioritize_in_search = (verification_status = 'verified')
WHERE provider_type IS NULL;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_cpf_already_registered(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_cpf_validation_rate_limit(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_visibility_score(TEXT, TEXT, BOOLEAN) TO authenticated;
