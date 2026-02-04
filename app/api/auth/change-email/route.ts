import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tvgpbocjlofvafdrrpzz.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2Z3Bib2NqbG9mdmFmZHJycHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNDExNTQsImV4cCI6MjA4MTcxNzE1NH0.tnON3r5HJyl2Rr02psFdBmK0XRr7BykOwhLgDMhCgNc"

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send verification email using Supabase Auth
async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {},
    })

    // Use Supabase Auth to send email verification
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        data: {
          verification_code: code,
          type: 'email_change'
        }
      }
    })

    if (error) {
      console.error('Supabase Auth Email Error:', error)
      return false
    }

    console.log(`Verification email sent to ${email} with code: ${code}`)
    return true

  } catch (error) {
    console.error('Error sending verification email:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, newEmail, code } = await request.json()

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
      if (!newEmail) {
        return NextResponse.json({ error: 'Novo email é obrigatório' }, { status: 400 })
      }

      if (newEmail === user.email) {
        return NextResponse.json({ error: 'O novo email deve ser diferente do atual' }, { status: 400 })
      }

      // Generate and send verification code
      const verificationCode = generateVerificationCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Save code to database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email_change_code: verificationCode,
          email_change_expires_at: expiresAt.toISOString(),
          pending_email_change: newEmail
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error updating profile for email change:', updateError)
        return NextResponse.json({ error: 'Erro ao salvar código' }, { status: 500 })
      }

      // Send verification email
      const emailSent = await sendVerificationEmail(newEmail, verificationCode)
      if (!emailSent) {
        // Clean up the code if email failed
        await supabase
          .from('profiles')
          .update({
            email_change_code: null,
            email_change_expires_at: null,
            pending_email_change: null
          })
          .eq('id', user.id)

        return NextResponse.json({ error: 'Erro ao enviar email de verificação' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Código enviado por email',
        expires_in: 600 // 10 minutes in seconds
      })

    } else if (action === 'verify_code') {
      if (!code || !newEmail) {
        return NextResponse.json({ error: 'Código e novo email são obrigatórios' }, { status: 400 })
      }

      // Get stored code and pending email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email_change_code, email_change_expires_at, pending_email_change')
        .eq('id', user.id)
        .single()

      if (!profile) {
        return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
      }

      if (profile.pending_email_change !== newEmail) {
        return NextResponse.json({ error: 'Email não corresponde ao solicitado' }, { status: 400 })
      }

      // Check if code is expired
      const expiresAt = new Date(profile.email_change_expires_at)
      if (expiresAt < new Date()) {
        return NextResponse.json({ error: 'Código expirado. Solicite um novo.' }, { status: 400 })
      }

      // Check if code matches
      if (profile.email_change_code !== code) {
        return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
      }

      // Update email in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (authError) {
        console.error('Error updating user email in auth:', authError)
        return NextResponse.json({ error: 'Erro ao atualizar email' }, { status: 500 })
      }

      // Clean up verification data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email_change_code: null,
          email_change_expires_at: null,
          pending_email_change: null
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error cleaning up email change data:', updateError)
        // Don't return error here as the email was already updated
      }

      return NextResponse.json({
        success: true,
        message: 'Email alterado com sucesso. Verifique sua caixa de entrada para confirmar a alteração.',
        email_updated: true
      })

    } else {
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    }

  } catch (error) {
    console.error('Email change error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}