import { z } from 'zod'

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username cannot exceed 50 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password cannot exceed 100 characters'),
})

export const loginSchema = z.object({
  username: z.string().min(1, 'Please enter username or email'),
  password: z.string().min(1, 'Please enter password'),
})

export const updateProfileSchema = z.object({
  fullName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
})

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Please enter current password'),
  new_password: z.string().min(8, 'New password must be at least 8 characters').max(100, 'New password cannot exceed 100 characters'),
})

export const updateSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  publicProfile: z.boolean().optional(),
  analyticsSharing: z.boolean().optional(),
  theme: z.enum(['light', 'dark']).optional(),
  language: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
})

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Please enter password to confirm'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
