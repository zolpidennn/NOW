import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        status: 'missing_env',
        message: 'Missing required Supabase environment variables',
        instruction: 'Please configure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY'
      }, { status: 500 })
    }

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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        status: 'missing_env',
        message: 'Missing required Supabase environment variables'
      }, { status: 500 })
    }

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
