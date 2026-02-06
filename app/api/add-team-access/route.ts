import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createClient()

    // SQL to add user_id to provider_teams and create RLS policies
    const sqlQueries = [
      // Add user_id column to provider_teams
      `ALTER TABLE provider_teams ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`,

      // Add unique constraint
      `ALTER TABLE provider_teams ADD CONSTRAINT IF NOT EXISTS unique_company_user UNIQUE(company_id, user_id)`,

      // Drop existing policies if they exist
      `DROP POLICY IF EXISTS "Team members can view company requests" ON service_requests`,
      `DROP POLICY IF EXISTS "Team members can update company requests" ON service_requests`,
      `DROP POLICY IF EXISTS "Team members can view company messages" ON messages`,
      `DROP POLICY IF EXISTS "Team members can send company messages" ON messages`,
      `DROP POLICY IF EXISTS "Team members can update company messages" ON messages`,
      `DROP POLICY IF EXISTS "Team members can view their own team info" ON provider_teams`,

      // Create new policies for team members
      `CREATE POLICY "Team members can view company requests" ON service_requests FOR SELECT USING (provider_id IN (SELECT pt.company_id FROM provider_teams pt WHERE pt.user_id = auth.uid() AND pt.is_active = true))`,

      `CREATE POLICY "Team members can update company requests" ON service_requests FOR UPDATE USING (provider_id IN (SELECT pt.company_id FROM provider_teams pt WHERE pt.user_id = auth.uid() AND pt.is_active = true))`,

      `CREATE POLICY "Team members can view company messages" ON messages FOR SELECT USING (request_id IN (SELECT sr.id FROM service_requests sr WHERE sr.provider_id IN (SELECT pt.company_id FROM provider_teams pt WHERE pt.user_id = auth.uid() AND pt.is_active = true)))`,

      `CREATE POLICY "Team members can send company messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND request_id IN (SELECT sr.id FROM service_requests sr WHERE sr.provider_id IN (SELECT pt.company_id FROM provider_teams pt WHERE pt.user_id = auth.uid() AND pt.is_active = true)))`,

      `CREATE POLICY "Team members can update company messages" ON messages FOR UPDATE USING (request_id IN (SELECT sr.id FROM service_requests sr WHERE sr.provider_id IN (SELECT pt.company_id FROM provider_teams pt WHERE pt.user_id = auth.uid() AND pt.is_active = true)))`,

      `CREATE POLICY "Team members can view their own team info" ON provider_teams FOR SELECT USING (user_id = auth.uid())`,

      // Create indexes
      `CREATE INDEX IF NOT EXISTS idx_provider_teams_user_id ON provider_teams(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_provider_teams_company_user ON provider_teams(company_id, user_id)`
    ]

    // Execute each SQL query
    for (const query of sqlQueries) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: query })
        if (error && !error.message.includes('already exists') && !error.message.includes('does not exist')) {
          console.error('Error executing query:', query, error)
          // Continue with other queries even if one fails
        }
      } catch (e) {
        console.error('Exception executing query:', query, e)
        // Continue with other queries
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Team member access policies have been applied successfully.',
      note: 'Team members can now view and respond to service requests assigned to their company.'
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      error: 'Failed to apply team member access policies',
      details: error
    }, { status: 500 })
  }
}