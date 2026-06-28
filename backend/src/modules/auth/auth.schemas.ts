import { z } from 'zod'

const email = z.string().trim().email().max(320).transform((value) => value.toLowerCase())

export const registerSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email,
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters long.')
    .max(128)
    .refine((value) => /[a-z]/.test(value), 'Password must include a lowercase letter.')
    .refine((value) => /[A-Z]/.test(value), 'Password must include an uppercase letter.')
    .refine((value) => /\d/.test(value), 'Password must include a number.')
})

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(128)
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
