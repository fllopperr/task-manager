import { PrismaClient } from '../../generated/prisma/index.js'
import type { CreateTaskInput, UpdateTaskInput } from './task.schema.js'

export class TaskRepository {
	constructor(private prisma: PrismaClient) {}

	async create(ownerId: string, data: CreateTaskInput) {
		const lastTask = await this.prisma.task.findFirst({
			where: { columnId: data.columnId },
			orderBy: { position: 'desc' },
			select: { position: true }
		})

		const newPosition = lastTask ? Number(lastTask.position) + 65536 : 65536

		return this.prisma.task.create({
			data: {
				title: data.title,
				columnId: data.columnId,
				ownerId,
				priority: data.priority ?? 'MEDIUM',
				tags: data.tags ?? [],
				description: data.description ?? '',
				limitDate: data.limitDate ? new Date(data.limitDate) : null,
				position: newPosition
			},
			include: {
				column: { select: { boardId: true } },
				owner: { select: { id: true, username: true, email: true } },
				assignee: { select: { id: true, username: true, email: true } }
			}
		})
	}

	async update(taskId: string, data: UpdateTaskInput) {
		const updateData: any = {}

		if (data.title !== undefined) updateData.title = data.title
		if (data.description !== undefined)
			updateData.description = data.description
		if (data.priority !== undefined) updateData.priority = data.priority
		if (data.tags !== undefined) updateData.tags = data.tags
		if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId
		if (data.columnId !== undefined) updateData.columnId = data.columnId
		if (data.position !== undefined) updateData.position = data.position
		if (data.limitDate !== undefined) {
			updateData.limitDate = data.limitDate ? new Date(data.limitDate) : null
		}

		return this.prisma.task.update({
			where: { id: taskId },
			data: updateData,
			include: {
				column: { select: { boardId: true } },
				owner: { select: { id: true, username: true, email: true } },
				assignee: { select: { id: true, username: true, email: true } },
				comments: {
					where: { deletedAt: null },
					include: {
						user: { select: { id: true, username: true, email: true } }
					},
					orderBy: { createdAt: 'asc' }
				}
			}
		})
	}

	async updatePosition(
		taskId: string,
		newColumnId: string,
		newPosition: number
	) {
		return this.prisma.task.update({
			where: { id: taskId },
			data: { columnId: newColumnId, position: newPosition },
			include: {
				column: { select: { boardId: true } }
			}
		})
	}

	async delete(taskId: string) {
		return this.prisma.task.delete({
			where: { id: taskId },
			include: {
				column: { select: { boardId: true } }
			}
		})
	}

	async findById(taskId: string) {
		return this.prisma.task.findUnique({
			where: { id: taskId },
			include: {
				owner: { select: { id: true, username: true, email: true } },
				assignee: { select: { id: true, username: true, email: true } },
				column: { select: { boardId: true } },
				comments: {
					where: { deletedAt: null },
					include: {
						user: { select: { id: true, username: true, email: true } }
					},
					orderBy: { createdAt: 'asc' }
				}
			}
		})
	}

	async isOwner(taskId: string, userId: string): Promise<boolean> {
		const task = await this.prisma.task.findFirst({
			where: { id: taskId, ownerId: userId },
			select: { id: true }
		})
		return task !== null
	}

	// Проверяем доступ к задаче через доску
	async isAccessible(taskId: string, userId: string): Promise<boolean> {
		const task = await this.prisma.task.findFirst({
			where: {
				id: taskId,
				column: {
					board: {
						OR: [{ ownerId: userId }, { members: { some: { userId } } }]
					}
				}
			},
			select: { id: true }
		})
		return task !== null
	}
}
