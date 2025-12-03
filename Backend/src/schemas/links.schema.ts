import { z } from 'zod'

export const createLinkSchema = z.object({
  original_url: z.string().url('Please enter a valid URL'),
  short_code: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/, 'Short code can only contain letters, numbers, underscores and hyphens').optional(),
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  tags: z.string().max(500).optional(),
  expires_at: z.string().datetime().optional(),
})

export const updateLinkSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  tags: z.string().max(500).optional(),
  is_active: z.boolean().optional(),
  expires_at: z.string().datetime().nullable().optional(),
})

export const batchCreateSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(100),
})

export const listLinksQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['created_at', 'click_count', 'title']).default('created_at'),
  search: z.string().optional(),
})

export type CreateLinkInput = z.infer<typeof createLinkSchema>
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>
export type BatchCreateInput = z.infer<typeof batchCreateSchema>
export type ListLinksQuery = z.infer<typeof listLinksQuery>
