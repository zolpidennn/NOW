import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tvgpbocjlofvafdrrpzz.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2Z3Bib2NqbG9mdmFmZHJycHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNDExNTQsImV4cCI6MjA4MTcxNzE1NH0.tnON3r5HJyl2Rr02psFdBmK0XRr7BykOwhLgDMhCgNc"

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send SMS using Twilio via Supabase Auth
async function sendSMS(phone: string, code: string): Promise<boolean> {
  try {
    // Use Supabase Auth SMS functionality (requires Twilio configured in Supabase)
    const { createClient } = await import('@supabase/supabase-js')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Format phone number for international format if needed
    // Assuming Brazilian numbers, add +55 if not present
    let formattedPhone = phone
    if (!phone.startsWith('+')) {
      // Remove all non-numeric characters
      const cleanPhone = phone.replace(/\D/g, '')
      // Add Brazil country code if it's a mobile number (9 digits after area code)
      if (cleanPhone.length === 11) {
        formattedPhone = `+55${cleanPhone}`
      } else if (cleanPhone.length === 10) {
        formattedPhone = `+55${cleanPhone}`
      }
    }

    // Use Supabase Auth to send SMS
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
      options: {
        data: {
          verification_code: code
        }
      }
    })

    if (error) {
      console.error('Twilio SMS Error:', error)
      return false
    }

    console.log(`SMS sent to ${formattedPhone} with code: ${code}`)
    return true

  } catch (error) {
    console.error('Error sending SMS via Twilio:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, phone, code } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Telefone é obrigatório' }, { status: 400 })
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    if (action === 'send_code') {
      // Generate and send verification code
      const verificationCode = generateVerificationCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Save code to database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone: phone,
          phone_verification_code: verificationCode,
          phone_verification_expires_at: expiresAt.toISOString(),
          phone_verified: false
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error updating profile:', updateError)
        return NextResponse.json({ error: 'Erro ao salvar código' }, { status: 500 })
      }

      // Send SMS via Twilio
      const smsSent = await sendSMS(phone, verificationCode)
      if (!smsSent) {
        // Clean up the code if SMS failed
        await supabase
          .from('profiles')
          .update({
            phone_verification_code: null,
            phone_verification_expires_at: null
          })
          .eq('id', user.id)

        return NextResponse.json({ error: 'Erro ao enviar SMS. Tente novamente.' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Código enviado por SMS',
        expires_in: 600 // 10 minutes in seconds
      })

    } else if (action === 'verify_code') {
      if (!code) {
        return NextResponse.json({ error: 'Código é obrigatório' }, { status: 400 })
      }

      // Get stored code
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone_verification_code, phone_verification_expires_at')
        .eq('id', user.id)
        .single()

      if (!profile) {
        return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
      }

      // Check if code is expired
      const expiresAt = new Date(profile.phone_verification_expires_at)
      if (expiresAt < new Date()) {
        return NextResponse.json({ error: 'Código expirado. Solicite um novo.' }, { status: 400 })
      }

      // Check if code matches
      if (profile.phone_verification_code !== code) {
        return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
      }

      // Mark phone as verified
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone_verified: true,
          phone_verification_code: null,
          phone_verification_expires_at: null
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error updating verification status:', updateError)
        return NextResponse.json({ error: 'Erro ao verificar telefone' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Telefone verificado com sucesso',
        verified: true
      })

    } else {
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    }

  } catch (error) {
    console.error('Phone verification error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}