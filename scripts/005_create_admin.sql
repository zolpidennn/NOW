-- ==========================================
-- NOW Security Marketplace - Create Admin
-- ==========================================
-- Script simplificado para criar usuário admin
-- Execute DEPOIS de criar sua conta no app

-- INSTRUÇÕES:
-- 1. Cadastre-se normalmente no app em /auth/sign-up
-- 2. Substitua 'seu-email@exemplo.com' pelo seu email
-- 3. Execute este script no Supabase SQL Editor

-- Tornar usuário admin
UPDATE public.profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'leonardo@oliport.com.br'
);

-- Verificar se funcionou
SELECT 
  u.email,
  p.full_name,
  p.is_admin
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'leonardo@oliport.com.br';
