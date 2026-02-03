import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const id = params.id

    const { data, error } = await supabase.from('products').select('*').eq('id', id)

    return NextResponse.json({ data, error }, { status: error ? 500 : 200 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
