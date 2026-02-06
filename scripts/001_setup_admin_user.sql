-- Alterado email do admin para leonardo@oliport.com.br
-- Criar o usuário admin leonardo@oliport.com.br
-- Este script deve ser executado no SQL Editor do Supabase

-- 1. Inserir o usuário no auth.users (isso normalmente é feito pelo Supabase Auth, mas vamos criar manualmente)
-- NOTA: Você deve criar este usuário pelo dashboard do Supabase em Authentication > Users
-- Email: leonardo@oliport.com.br
-- Password: Leolucena1
-- Certifique-se de confirmar o email automaticamente

-- 2. Após criar o usuário manualmente, execute este script para adicionar como admin
-- Primeiro, obtenha o user_id do usuário criado
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Buscar o ID do usuário leonardo@oliport.com.br
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'leonardo@oliport.com.br';

  -- Se o usuário existir, inserir na tabela admins
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.admins (user_id, email, created_at, updated_at)
    VALUES (admin_user_id, 'leonardo@oliport.com.br', NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Garantir que o perfil existe
    INSERT INTO public.profiles (id, full_name, created_at, updated_at)
    VALUES (admin_user_id, 'Leonardo - Admin Master', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET full_name = 'Leonardo - Admin Master';
    
    RAISE NOTICE 'Usuário admin configurado com sucesso!';
  ELSE
    RAISE EXCEPTION 'Usuário leonardo@oliport.com.br não encontrado. Por favor, crie o usuário primeiro no dashboard do Supabase.';
  END IF;
END $$;
