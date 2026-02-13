import { PrismaClient, type Priority } from '../generated/prisma/index.js'

export class TaskRepository {
	constructor(private prisma: PrismaClient) {}

	async create(data: {
		title: string
		columnId: string
		ownerId: string
		priority?: Priority
		tags?: string[]
		description?: string
	}) {
		const lastTask = await this.prisma.task.findFirst({
			where: { columnId: data.columnId },
			orderBy: { position: 'desc' },
			select: { position: true }
		})

		const lastPosition = lastTask ? Number(lastTask.position) : 0
		const newPosition = lastPosition + 65536

		return this.prisma.task.create({
			data: {
				title: data.title,
				columnId: data.columnId,
				ownerId: data.ownerId,
				priority: data.priority || 'MEDIUM',
				tags: data.tags || [],
				description: data.description || '',
				position: newPosition
			},
			include: {
				column: {
					select: { boardId: true }
				},
				owner: {
					select: { id: true, username: true, email: true }
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
			data: {
				columnId: newColumnId,
				position: newPosition
			},
			include: {
				column: {
					select: { boardId: true }
				}
			}
		})
	}
	async delete(taskId: string) {
		return this.prisma.task.delete({
			where: { id: taskId },
			include: {
				column: {
					select: { boardId: true }
				}
			}
		})
	}
	async findById(taskId: string) {
		return this.prisma.task.findUnique({
			where: { id: taskId },
			include: {
				owner: { select: { id: true, username: true } },
				comments: {
					include: {
						user: { select: { id: true, username: true } }
					}
				}
			}
		})
	}
}
