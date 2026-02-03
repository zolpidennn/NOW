-- ============================================
-- CLEANUP: Drop old policies and re-execute
-- ============================================
-- Run this FIRST if you already executed the migration once

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can see their own admin records" ON public.company_admins;
DROP POLICY IF EXISTS "Company owners can see admins" ON public.company_admins;
DROP POLICY IF EXISTS "Company admins can see company admins" ON public.company_admins;
DROP POLICY IF EXISTS "Company owners can insert admins" ON public.company_admins;
DROP POLICY IF EXISTS "Company owners can update admins" ON public.company_admins;
DROP POLICY IF EXISTS "Company owners can delete admins" ON public.company_admins;

DROP POLICY IF EXISTS "Company owners can see documents" ON public.company_documents;
DROP POLICY IF EXISTS "Company admins can see documents" ON public.company_documents;
DROP POLICY IF EXISTS "Company owners can insert documents" ON public.company_documents;

-- Now re-execute the new policies from 027_create_company_admin_tables.sql
-- Copy all the CREATE POLICY sections from that file
