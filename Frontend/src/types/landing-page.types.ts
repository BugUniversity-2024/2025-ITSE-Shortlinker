export interface LandingPage {
  id: number
  link_id: number
  html_content: string
  css_content: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface UpdateLandingPageData {
  html_content?: string
  css_content?: string
  is_published?: boolean
}

export interface LandingPageTemplate {
  id: number
  name: string
  description: string
  thumbnail: string
  html_content: string
  css_content: string
}
