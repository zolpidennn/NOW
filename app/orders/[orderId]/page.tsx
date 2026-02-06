import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ServiceOrderDetailClient from '@/components/service-order-detail-client'
import ProductOrderDetailClient from '@/components/product-order-detail-client'

export default async function OrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Try service request first
  const { data: serviceRequest } = await supabase
    .from('service_requests')
    .select(
      `*, service_providers (id, company_name, phone, email, logo_url, rating, total_reviews), service:services (name), service_categories (name)`
    )
    .eq('id', orderId)
    .maybeSingle()

  if (serviceRequest) {
    return (
      <div className="page-transition min-h-screen bg-background p-4">
        <h1 className="mb-4 text-2xl font-bold text-foreground">Detalhes do Pedido de Serviço</h1>
        {/* render client card */}
        {/* @ts-expect-error Server -> Client prop */}
        <ServiceOrderDetailClient request={serviceRequest} />
      </div>
    )
  }

  // Try product order
  const { data: productOrder } = await supabase
    .from('product_orders')
    .select(`*, products (name, image_url)`)
    .eq('id', orderId)
    .maybeSingle()

  if (productOrder) {
    return (
      <div className="page-transition min-h-screen bg-background p-4">
        <h1 className="mb-4 text-2xl font-bold text-foreground">Detalhes do Pedido</h1>
        {/* @ts-expect-error Server -> Client prop */}
        <ProductOrderDetailClient order={productOrder} />
      </div>
    )
  }

  notFound()
}
