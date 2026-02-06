-- ==========================================
-- Adicionar campos de verificação de telefone
-- ==========================================

-- Adicionar campos necessários para verificação SMS
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_verification_code TEXT,
ADD COLUMN IF NOT EXISTS phone_verification_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Criar índice para busca por código de verificação
CREATE INDEX IF NOT EXISTS idx_profiles_phone_verification_code
ON public.profiles(phone_verification_code)
WHERE phone_verification_code IS NOT NULL;

-- Criar índice para verificação de telefone
CREATE INDEX IF NOT EXISTS idx_profiles_phone_verified
ON public.profiles(phone_verified);

-- Atualizar trigger para campos de verificação
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- Trigger para limpar códigos expirados (executar diariamente)
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.profiles
  SET
    phone_verification_code = NULL,
    phone_verification_expires_at = NULL
  WHERE
    phone_verification_expires_at IS NOT NULL
    AND phone_verification_expires_at < NOW();
END;
$$;

-- Criar função para limpeza automática (pode ser chamada por cron)
-- Para uso futuro com pg_cron ou tarefa agendada