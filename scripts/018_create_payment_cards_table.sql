-- ==========================================
-- Tabela de Cartões de Pagamento
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payment_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Dados do cartão (armazenados de forma segura)
  card_number_last4 text NOT NULL, -- Últimos 4 dígitos
  card_brand text NOT NULL, -- visa, mastercard, amex, etc
  card_holder_name text NOT NULL,
  expiration_month integer NOT NULL CHECK (expiration_month >= 1 AND expiration_month <= 12),
  expiration_year integer NOT NULL CHECK (expiration_year >= EXTRACT(YEAR FROM CURRENT_DATE)),
  
  -- Validação
  is_valid boolean DEFAULT true,
  validation_status text DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'invalid', 'expired')),
  validation_message text,
  
  -- Status
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  
  -- Metadados
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_payment_cards_user_id ON public.payment_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_cards_active ON public.payment_cards(user_id, is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE public.payment_cards ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios cartões
CREATE POLICY "Users can view own payment cards"
  ON public.payment_cards
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem inserir seus próprios cartões
CREATE POLICY "Users can insert own payment cards"
  ON public.payment_cards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar seus próprios cartões
CREATE POLICY "Users can update own payment cards"
  ON public.payment_cards
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar seus próprios cartões
CREATE POLICY "Users can delete own payment cards"
  ON public.payment_cards
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER payment_cards_updated_at
  BEFORE UPDATE ON public.payment_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função para garantir apenas um cartão padrão por usuário
CREATE OR REPLACE FUNCTION public.ensure_single_default_card()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_default = true THEN
    -- Remove o padrão de outros cartões do mesmo usuário
    UPDATE public.payment_cards
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para garantir apenas um cartão padrão
CREATE TRIGGER ensure_single_default_card_trigger
  BEFORE INSERT OR UPDATE ON public.payment_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_default_card();
