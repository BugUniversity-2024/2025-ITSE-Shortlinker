import { z } from 'zod'

export const registerSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符').max(50, '用户名最多50个字符'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(8, '密码至少8个字符').max(100, '密码最多100个字符'),
})

export const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名或邮箱'),
  password: z.string().min(1, '请输入密码'),
})

export const updateProfileSchema = z.object({
  fullName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
})

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, '请输入当前密码'),
  new_password: z.string().min(8, '新密码至少8个字符').max(100, '新密码最多100个字符'),
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
  password: z.string().min(1, '请输入密码确认'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
