import { z } from 'zod'

export const CreateBoardSchema = z.object({
	title: z
		.string()
		.min(1, 'Название обязательно')
		.max(255, 'Максимум 255 символов'),
	icon: z.string().max(100).optional()
})

export const AddBoardMemberSchema = z.object({
	boardId: z.string().cuid('Некорректный boardId'),
	email: z.string().email('Некорректный email'),
	role: z.enum(['ADMIN', 'MEMBER']).optional().default('MEMBER')
})

export type CreateBoardInput = z.infer<typeof CreateBoardSchema>
export type AddBoardMemberInput = z.infer<typeof AddBoardMemberSchema>
