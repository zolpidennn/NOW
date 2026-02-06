import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const formData = await request.formData()

    const file = formData.get('file') as File
    const companyId = formData.get('companyId') as string
    const documentType = formData.get('documentType') as string

    if (!file || !companyId || !documentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user is authorized (admin or company admin)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user has access to this company
    const { data: companyAdmin } = await supabase
      .from('company_admins')
      .select('permission_level')
      .eq('company_id', companyId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    const isSystemAdmin = user.email === 'leonardo@oliport.com.br'

    if (!companyAdmin && !isSystemAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${companyId}/${documentType}_${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('company-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('company-documents')
      .getPublicUrl(fileName)

    // Save document record
    const { data: docData, error: dbError } = await supabase
      .from('company_documents')
      .insert([{
        company_id: companyId,
        document_type: documentType,
        file_url: publicUrl,
        file_name: file.name
      }])
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      document: docData
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}