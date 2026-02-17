import { z } from 'zod'

export const CreateCommentSchema = z.object({
	content: z.string().min(1, 'Комментарий не может быть пустым').max(5000),
	taskId: z.string().min(1, 'taskId обязателен')
})

export const UpdateCommentSchema = z.object({
	content: z.string().min(1, 'Комментарий не может быть пустым').max(5000)
})

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>
