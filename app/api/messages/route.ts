import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { request_id, message } = body

    if (!request_id || !message) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    // Verificar se o usuário tem permissão para enviar mensagem nessa solicitação
    const { data: serviceRequest } = await supabase
      .from("service_requests")
      .select("customer_id, provider_id")
      .eq("id", request_id)
      .single()

    if (!serviceRequest) {
      return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 })
    }

    // Verificar se é o cliente ou o prestador
    const { data: isProvider } = await supabase
      .from("service_providers")
      .select("id")
      .eq("user_id", user.id)
      .eq("id", serviceRequest.provider_id)
      .single()

    if (serviceRequest.customer_id !== user.id && !isProvider) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        request_id,
        sender_id: user.id,
        message,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Erro ao criar mensagem:", error)
    return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get("request_id")

    if (!requestId) {
      return NextResponse.json({ error: "request_id é obrigatório" }, { status: 400 })
    }

    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: true })

    if (error) throw error

    return NextResponse.json(messages)
  } catch (error) {
    console.error("[v0] Erro ao buscar mensagens:", error)
    return NextResponse.json({ error: "Erro ao buscar mensagens" }, { status: 500 })
  }
}
