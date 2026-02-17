import { z } from 'zod'

const PriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])

export const CreateTaskSchema = z.object({
	title: z
		.string()
		.min(1, 'Название обязательно')
		.max(255, 'Максимум 255 символов'),
	columnId: z.string().min(1, 'columnId обязателен'),
	priority: PriorityEnum.optional().default('MEDIUM'),
	description: z.string().max(10000).optional(),
	tags: z.array(z.string().max(50)).max(20).optional().default([])
})

export const UpdateTaskSchema = z.object({
	title: z.string().min(1).max(255).optional(),
	priority: PriorityEnum.optional(),
	description: z.string().max(10000).optional(),
	tags: z.array(z.string().max(50)).max(20).optional(),
	assigneeId: z.string().nullable().optional()
})

export const MoveTaskSchema = z.object({
	taskId: z.string().min(1),
	newColumnId: z.string().min(1),
	newPosition: z.number().positive()
})

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>
export type MoveTaskInput = z.infer<typeof MoveTaskSchema>
