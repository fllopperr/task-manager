import { z } from 'zod'

export const CreateColumnSchema = z.object({
	title: z
		.string()
		.min(1, 'Название обязательно')
		.max(255, 'Максимум 255 символов'),
	boardId: z.string().min(1),
	position: z.number().positive()
})

export const UpdateColumnSchema = z.object({
	title: z.string().min(1).max(255).optional(),
	position: z.number().positive().optional()
})

export type CreateColumnInput = z.infer<typeof CreateColumnSchema>
export type UpdateColumnInput = z.infer<typeof UpdateColumnSchema>
