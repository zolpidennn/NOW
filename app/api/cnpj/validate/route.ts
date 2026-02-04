import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isValidCNPJ, cleanCNPJ } from "@/lib/cnpj-validator"
import { validateCNPJWithReceitaFederal, isCNAECompatible } from "@/lib/brasil-api"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { cnpj } = await request.json()

    if (!cnpj) {
      return NextResponse.json({ error: "CNPJ é obrigatório" }, { status: 400 })
    }

    // Technical validation first
    if (!isValidCNPJ(cnpj)) {
      return NextResponse.json({ error: "CNPJ inválido" }, { status: 400 })
    }

    const cleanedCNPJ = cleanCNPJ(cnpj)
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Check rate limiting
    const { data: rateLimitCheck } = await supabase.rpc("check_cnpj_validation_rate_limit", {
      p_ip_address: ipAddress,
      p_user_id: user.id,
    })

    if (rateLimitCheck === false) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
        { status: 429 },
      )
    }

    // Check if CNPJ is already registered
    const { data: existingProvider } = await supabase
      .from("service_providers")
      .select("id, company_name, verification_status")
      .eq("cnpj", cleanedCNPJ)
      .single()

    if (existingProvider) {
      // Log attempt
      await supabase.from("cnpj_validation_attempts").insert({
        cnpj: cleanedCNPJ,
        user_id: user.id,
        ip_address: ipAddress,
        validation_success: false,
        error_message: "CNPJ já cadastrado",
      })

      return NextResponse.json({ error: "Este CNPJ já está cadastrado no sistema" }, { status: 400 })
    }

    // Validate with Receita Federal
    const validation = await validateCNPJWithReceitaFederal(cleanedCNPJ)

    // Log validation attempt
    await supabase.from("cnpj_validation_attempts").insert({
      cnpj: cleanedCNPJ,
      user_id: user.id,
      ip_address: ipAddress,
      validation_success: validation.success,
      validation_data: validation.data || null,
      error_message: validation.error || null,
    })

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Check if CNAE is compatible
    const cnaeCompatible = isCNAECompatible(validation.data!.cnae_fiscal)

    if (!cnaeCompatible) {
      return NextResponse.json(
        {
          error: "CNAE não compatível com os serviços oferecidos no marketplace",
          warning: true,
          data: validation.data,
        },
        { status: 200 },
      )
    }

    return NextResponse.json({
      success: true,
      data: validation.data,
    })
  } catch (error) {
    console.error("[v0] Error in CNPJ validation:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
