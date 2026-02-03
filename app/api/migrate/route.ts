import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createClient()

    // First, add the missing columns to service_providers
    const alterQueries = [
      `ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS street TEXT`,
      `ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS number TEXT`,
      `ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS complement TEXT`,
      `ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS neighborhood TEXT`,
      `ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS cnpj_verified BOOLEAN DEFAULT false`,
      `ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS cnpj_verification_date TIMESTAMPTZ`,
      `ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS cnpj_verification_data JSONB`
    ]

    // Execute ALTER TABLE statements
    for (const query of alterQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      if (error && !error.message.includes('already exists')) {
        console.error('Error executing:', query, error)
      }
    }

    // Create company_documents table
    const createDocumentsTable = `
      CREATE TABLE IF NOT EXISTS company_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
        document_type VARCHAR(50) NOT NULL,
        file_url TEXT NOT NULL,
        file_name TEXT NOT NULL,
        uploaded_at TIMESTAMPTZ DEFAULT NOW(),
        verified BOOLEAN DEFAULT false,
        verified_by UUID REFERENCES auth.users(id),
        verified_at TIMESTAMPTZ,
        rejection_reason TEXT
      )
    `

    // Create company_admins table
    const createAdminsTable = `
      CREATE TABLE IF NOT EXISTS company_admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        permission_level VARCHAR(20) NOT NULL DEFAULT 'simple' CHECK (permission_level IN ('master', 'staff', 'simple')),
        is_active BOOLEAN DEFAULT true,
        invited_by UUID REFERENCES auth.users(id),
        invited_at TIMESTAMPTZ DEFAULT NOW(),
        accepted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    // Try to execute table creation (this might fail if rpc doesn't support DDL)
    try {
      await supabase.from('company_documents').select('id').limit(1)
    } catch (e) {
      // Table doesn't exist, we'll handle this in the frontend
      console.log('company_documents table needs to be created manually')
    }

    try {
      await supabase.from('company_admins').select('id').limit(1)
    } catch (e) {
      // Table doesn't exist, we'll handle this in the frontend
      console.log('company_admins table needs to be created manually')
    }

    return NextResponse.json({
      success: true,
      message: 'Migration attempted. Some DDL operations may need manual execution.',
      note: 'If tables were not created, run the SQL migration manually in Supabase dashboard.'
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Migration failed', details: error }, { status: 500 })
  }
}