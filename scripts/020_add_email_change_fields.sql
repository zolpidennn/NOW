-- ==========================================
-- Adicionar campos para alteração de email
-- ==========================================

-- Adicionar campos necessários para alteração de email
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_change_code TEXT,
ADD COLUMN IF NOT EXISTS email_change_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pending_email_change TEXT;

-- Criar índice para busca por código de alteração de email
CREATE INDEX IF NOT EXISTS idx_profiles_email_change_code
ON public.profiles(email_change_code)
WHERE email_change_code IS NOT NULL;

-- Criar índice para email pendente
CREATE INDEX IF NOT EXISTS idx_profiles_pending_email_change
ON public.profiles(pending_email_change)
WHERE pending_email_change IS NOT NULL;

-- Função para limpeza automática de códigos expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_email_changes()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.profiles
  SET
    email_change_code = NULL,
    email_change_expires_at = NULL,
    pending_email_change = NULL
  WHERE
    email_change_expires_at IS NOT NULL
    AND email_change_expires_at < NOW();
END;
$$;

-- Garantir que apenas um email pendente por usuário
CREATE OR REPLACE FUNCTION public.ensure_single_pending_email_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Limpar dados de alteração de email pendentes para outros usuários com o mesmo email
  IF NEW.pending_email_change IS NOT NULL THEN
    UPDATE public.profiles
    SET
      email_change_code = NULL,
      email_change_expires_at = NULL,
      pending_email_change = NULL
    WHERE
      pending_email_change = NEW.pending_email_change
      AND id != NEW.id;
  END IF;

  -- Limpar códigos expirados do próprio usuário
  IF NEW.email_change_expires_at IS NOT NULL AND NEW.email_change_expires_at < NOW() THEN
    NEW.email_change_code = NULL;
    NEW.email_change_expires_at = NULL;
    NEW.pending_email_change = NULL;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger para garantir limpeza automática
DROP TRIGGER IF EXISTS ensure_single_pending_email_change_trigger ON public.profiles;
CREATE TRIGGER ensure_single_pending_email_change_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_pending_email_change();