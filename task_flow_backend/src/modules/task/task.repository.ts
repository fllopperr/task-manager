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
				position: newPosition
			},
			include: {
				column: { select: { boardId: true } },
				owner: { select: { id: true, username: true, email: true } }
			}
		})
	}

	async update(taskId: string, data: UpdateTaskInput) {
		return this.prisma.task.update({
			where: { id: taskId },
			data,
			include: {
				column: { select: { boardId: true } },
				owner: { select: { id: true, username: true, email: true } }
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
				owner: { select: { id: true, username: true } },
				column: { select: { boardId: true } },
				comments: {
					where: { deletedAt: null },
					include: { user: { select: { id: true, username: true } } },
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
