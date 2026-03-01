import { z } from 'zod'

export const UpdateUserSchema = z.object({
	username: z.string().min(1, 'Имя слишком короткое').max(255).optional(),
	email: z.string().email('Неверный формат email').optional()
})

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
