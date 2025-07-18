export interface Client {
  id: string
  user_id: string
  name: string
  email: string
  phone?: string
  company?: string
  created_at: string
  updated_at: string
}

export interface Domain {
  id: string
  user_id: string
  client_id: string
  domain_name: string
  registrar?: string
  expiration_date: string
  dns_provider?: string
  status: 'active' | 'expired' | 'expiring'
  created_at: string
  updated_at: string
}

export interface Hosting {
  id: string
  user_id: string
  client_id: string
  service_name: string
  provider?: string
  plan_type?: string
  expiration_date: string
  status: 'active' | 'expired' | 'expiring'
  created_at: string
  updated_at: string
}

export interface AppUser {
  id: string
  user_id: string
  email: string
  name?: string
  role: 'admin' | 'standard'
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  totalClients: number
  activeDomains: number
  activeHosting: number
  expiringServices: number
}