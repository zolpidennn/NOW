import { createClient } from "@/lib/supabase/server"
import { isValidCPF, cleanCPF } from "@/lib/cpf-validator"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { cpf } = await request.json()

    if (!cpf) {
      return NextResponse.json({ error: "CPF é obrigatório" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Get IP address
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Check rate limiting
    const { data: rateLimitCheck } = await supabase.rpc("check_cpf_validation_rate_limit", {
      p_ip_address: ipAddress,
      p_user_id: user.id,
    })

    if (!rateLimitCheck) {
      return NextResponse.json(
        {
          error: "Limite de tentativas excedido. Tente novamente mais tarde.",
        },
        { status: 429 },
      )
    }

    // Technical validation
    const cleanedCPF = cleanCPF(cpf)
    const isValid = isValidCPF(cleanedCPF)

    if (!isValid) {
      // Log failed attempt
      await supabase.from("cpf_validation_attempts").insert({
        cpf: cleanedCPF,
        user_id: user.id,
        ip_address: ipAddress,
        validation_success: false,
        error_message: "CPF inválido (dígitos verificadores incorretos)",
      })

      return NextResponse.json({ error: "CPF inválido" }, { status: 400 })
    }

    // Check if CPF is already registered
    const { data: isRegistered } = await supabase.rpc("is_cpf_already_registered", {
      p_cpf: cleanedCPF,
    })

    if (isRegistered) {
      await supabase.from("cpf_validation_attempts").insert({
        cpf: cleanedCPF,
        user_id: user.id,
        ip_address: ipAddress,
        validation_success: false,
        error_message: "CPF já cadastrado no sistema",
      })

      return NextResponse.json({ error: "Este CPF já está cadastrado no sistema" }, { status: 409 })
    }

    // Log successful validation
    await supabase.from("cpf_validation_attempts").insert({
      cpf: cleanedCPF,
      user_id: user.id,
      ip_address: ipAddress,
      validation_success: true,
      validation_data: {
        validated_at: new Date().toISOString(),
        validation_method: "technical",
      },
    })

    return NextResponse.json({
      success: true,
      cpf: cleanedCPF,
      valid: true,
      message: "CPF validado com sucesso",
    })
  } catch (error) {
    console.error("[v0] CPF validation error:", error)
    return NextResponse.json({ error: "Erro ao validar CPF" }, { status: 500 })
  }
}
