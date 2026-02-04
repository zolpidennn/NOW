import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tvgpbocjlofvafdrrpzz.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2Z3Bib2NqbG9mdmFmZHJycHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNDExNTQsImV4cCI6MjA4MTcxNzE1NH0.tnON3r5HJyl2Rr02psFdBmK0XRr7BykOwhLgDMhCgNc"

export async function POST(request: NextRequest) {
  // Create response with redirect to home
  const response = NextResponse.redirect(new URL('/', request.url))

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      // Still clear cookies and redirect even if signOut fails
      response.cookies.delete('sb-auth-token')
      response.cookies.delete('sb-refresh-token')
      // Delete all supabase auth cookies
      Array.from({ length: 50 }).forEach((_, i) => {
        const cookieNames = [
          'sb-' + i,
          'supabase-' + i,
          'sb-auth-token',
          'sb-refresh-token',
          'auth-token',
          'refresh-token'
        ]
        cookieNames.forEach(name => {
          response.cookies.delete(name)
        })
      })
    }

    return response
  } catch (err) {
    console.error('Logout exception:', err)
    // Still redirect on error
    const errorResponse = NextResponse.redirect(new URL('/', request.url))
    // Clear all auth cookies
    Array.from({ length: 50 }).forEach((_, i) => {
      const cookieNames = [
        'sb-' + i,
        'supabase-' + i,
        'sb-auth-token',
        'sb-refresh-token',
        'auth-token',
        'refresh-token'
      ]
      cookieNames.forEach(name => {
        errorResponse.cookies.delete(name)
      })
    })
    return errorResponse
  }
}

// Also support GET for backward compatibility
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url))

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      // Still clear cookies and redirect even if signOut fails
      response.cookies.delete('sb-auth-token')
      response.cookies.delete('sb-refresh-token')
      return response
    }

    return response
  } catch (err) {
    console.error('Logout exception:', err)
    // Still redirect on error
    const errorResponse = NextResponse.redirect(new URL('/', request.url))
    return errorResponse
  }
}