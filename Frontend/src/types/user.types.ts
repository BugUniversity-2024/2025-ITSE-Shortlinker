export interface User {
  id: number
  username: string
  email: string
  full_name?: string
  phone?: string
  bio?: string
  avatar?: string
  plan_type: 'free' | 'pro' | 'enterprise'
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface UserSettings {
  email_notifications: boolean
  public_profile: boolean
  analytics_sharing: boolean
}

export interface UserStats {
  total_links: number
  total_clicks: number
  active_links: number
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
}
