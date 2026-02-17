import { z } from 'zod'

export const LoginSchema = z.object({
	email: z.string().email('Некорректный email'),
	password: z.string().min(6, 'Пароль обязателен')
})

export const RegisterSchema = z.object({
	email: z.string().email('Некорректный email'),
	username: z
		.string()
		.min(3, 'Username минимум 3 символа')
		.max(32, 'Username максимум 32 символа')
		.regex(
			/^[a-zA-Z0-9_]+$/,
			'Username может содержать только буквы, цифры и _'
		),
	password: z
		.string()
		.min(8, 'Пароль минимум 8 символов')
		.max(100, 'Пароль максимум 100 символов')
})

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
