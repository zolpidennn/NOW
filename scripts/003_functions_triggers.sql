-- ==========================================
-- NOW Security Marketplace - Functions & Triggers
-- ==========================================
-- Execute DEPOIS do script 002_rls_policies.sql

-- ==========================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_service_providers
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_addresses
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_services
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_service_requests
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_product_orders
  BEFORE UPDATE ON public.product_orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- FUNÇÃO: Criar perfil ao registrar usuário
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- FUNÇÃO: Atualizar rating do prestador
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_provider_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating numeric(3,2);
  review_count integer;
BEGIN
  SELECT AVG(rating), COUNT(*)
  INTO avg_rating, review_count
  FROM public.reviews
  WHERE provider_id = NEW.provider_id;
  
  UPDATE public.service_providers
  SET rating = COALESCE(avg_rating, 0),
      total_reviews = review_count
  WHERE id = NEW.provider_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar rating
CREATE TRIGGER update_rating_on_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_provider_rating();

-- ==========================================
-- FUNÇÃO: Atualizar visibilidade do prestador
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_provider_visibility()
RETURNS TRIGGER AS $$
BEGIN
  -- PJ verificada: 100 pontos base
  IF NEW.provider_type = 'PJ' AND NEW.verification_status = 'verified' THEN
    NEW.visibility_score := 100;
  -- PF: 50 pontos base
  ELSIF NEW.provider_type = 'PF' AND NEW.verification_status = 'verified' THEN
    NEW.visibility_score := 50;
  ELSE
    NEW.visibility_score := 0;
  END IF;
  
  -- Bônus por avaliações (até +50 pontos)
  IF NEW.total_reviews > 0 THEN
    NEW.visibility_score := NEW.visibility_score + LEAST(50, NEW.total_reviews * 2);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar visibilidade
CREATE TRIGGER update_visibility_score
  BEFORE INSERT OR UPDATE OF verification_status, provider_type, total_reviews
  ON public.service_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_provider_visibility();

-- ==========================================
-- FUNÇÃO: Incrementar vendas do produto
-- ==========================================
CREATE OR REPLACE FUNCTION public.increment_product_sales()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE public.products
    SET sales_count = sales_count + NEW.quantity
    WHERE id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para incrementar vendas
CREATE TRIGGER increment_sales_on_delivery
  AFTER UPDATE ON public.product_orders
  FOR EACH ROW EXECUTE FUNCTION public.increment_product_sales();

-- ==========================================
-- FUNÇÃO: Garantir apenas um endereço principal
-- ==========================================
CREATE OR REPLACE FUNCTION public.ensure_single_primary_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE public.addresses
    SET is_primary = false
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para endereço principal
CREATE TRIGGER ensure_primary_address
  BEFORE INSERT OR UPDATE OF is_primary
  ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.ensure_single_primary_address();
