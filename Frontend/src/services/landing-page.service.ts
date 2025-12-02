import api from './api'
import type { LandingPage, UpdateLandingPageData, LandingPageTemplate } from '@/types'

export const landingPageService = {
  // Get landing page for a link
  async getLandingPage(linkId: number): Promise<LandingPage> {
    const response = await api.get<LandingPage>(`/landing-pages/${linkId}`)
    return response.data
  },

  // Create/update landing page
  async updateLandingPage(linkId: number, data: UpdateLandingPageData): Promise<LandingPage> {
    const response = await api.put<LandingPage>(`/landing-pages/${linkId}`, data)
    return response.data
  },

  // Delete landing page
  async deleteLandingPage(linkId: number): Promise<void> {
    await api.delete(`/landing-pages/${linkId}`)
  },

  // Preview landing page
  async previewLandingPage(data: { html_content: string; css_content: string }): Promise<string> {
    const response = await api.post<{ preview_url: string }>('/landing-pages/preview', data)
    return response.data.preview_url
  },

  // Get template list
  async getTemplates(): Promise<LandingPageTemplate[]> {
    const response = await api.get<LandingPageTemplate[]>('/landing-pages/templates')
    return response.data
  },

  // Publish landing page
  async publishLandingPage(linkId: number): Promise<LandingPage> {
    const response = await api.post<LandingPage>(`/landing-pages/${linkId}/publish`)
    return response.data
  },

  // Unpublish landing page
  async unpublishLandingPage(linkId: number): Promise<LandingPage> {
    const response = await api.post<LandingPage>(`/landing-pages/${linkId}/unpublish`)
    return response.data
  }
}
