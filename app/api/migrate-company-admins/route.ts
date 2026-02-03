import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tvgpbocjlofvafdrrpzz.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2Z3Bib2NqbG9mdmFmZHJycHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNDExNTQsImV4cCI6MjA4MTcxNzE1NH0.tnON9r5HJyl2Rr02psFdBmK0XRr7BykOwhLgDMhCgNc"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2Z3Bib2NqbG9mdmFmZHJycHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE0MTE1NCwiZXhwIjoyMDgxNzE3MTU0fQ.FMv5YRlL64RDjNFLhDJJ7oaWiWtCqWwCNWRzR9opuhQ"

export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    // Try to verify table exists with service role key
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if table already exists by trying to query it
    try {
      const { data, error } = await adminSupabase
        .from('company_admins')
        .select('id', { count: 'exact', head: true })
        .limit(1)

      if (!error || (error && error.code !== 'PGRST205')) {
        // Table exists or different error
        return NextResponse.json({
          success: true,
          message: 'Table company_admins already exists',
          status: 'exists'
        })
      }
    } catch (err) {
      // Continue with creation attempt
    }

    // If we get here, table doesn't exist - need manual execution
    return NextResponse.json({
      success: false,
      status: 'missing',
      message: 'Table company_admins does not exist and needs to be created manually',
      instruction: 'Execute the SQL in scripts/027_create_company_admin_tables.sql via Supabase SQL Editor',
      error: 'RPC execution not available. Please run SQL migration manually.'
    }, { status: 501 })
  } catch (error) {
    console.error('Migration check error:', error)
    return NextResponse.json({
      success: false,
      status: 'error',
      message: 'Failed to check/create table',
      details: String(error)
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if table exists
    const { error } = await adminSupabase
      .from('company_admins')
      .select('id', { count: 'exact', head: true })
      .limit(1)

    if (error && error.code === 'PGRST205') {
      return NextResponse.json({
        status: 'missing',
        message: 'company_admins table does not exist',
        instruction: 'Execute scripts/027_create_company_admin_tables.sql in Supabase SQL Editor'
      })
    }

    return NextResponse.json({
      status: 'exists',
      message: 'company_admins table exists'
    })
  } catch (error) {
    console.error('Check failed:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Check failed',
      details: String(error)
    }, { status: 500 })
  }
}
