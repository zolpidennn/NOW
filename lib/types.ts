export interface Profile {
  id: string
  full_name: string
  phone?: string
  phone_verified?: boolean
  email?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  created_at: string
  updated_at: string
}

export interface ServiceProvider {
  id: string
  user_id?: string
  company_name: string
  description?: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zip_code: string
  rating: number
  total_reviews: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ServiceCategory {
  id: string
  name: string
  description?: string
  icon_name?: string
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Service {
  id: string
  provider_id: string
  category_id: string
  name: string
  description?: string
  estimated_duration?: number
  base_price?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ServiceRequest {
  id: string
  customer_id: string
  service_id: string
  provider_id: string
  status: "pending" | "accepted" | "scheduled" | "in_progress" | "completed" | "cancelled"
  service_type: string
  address: string
  city: string
  state: string
  zip_code: string
  scheduled_date?: string
  completed_date?: string
  notes?: string
  total_price?: number
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  request_id: string
  sender_id: string
  message: string
  is_read: boolean
  created_at: string
}

export interface Review {
  id: string
  request_id: string
  customer_id: string
  provider_id: string
  rating: number
  comment?: string
  created_at: string
}

export interface PaymentCard {
  id: string
  user_id: string
  card_number_last4: string
  card_brand: string
  card_holder_name: string
  expiration_month: number
  expiration_year: number
  is_valid: boolean
  validation_status: "pending" | "valid" | "invalid" | "expired"
  validation_message?: string
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}