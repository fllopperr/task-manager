import { TaskRepository } from './task.repository.js'
import {
	CreateTaskSchema,
	UpdateTaskSchema,
	MoveTaskSchema
} from './task.schema.js'
import { StatsService } from '../stats/stats.service.js'
import type { PrismaClient } from '../../generated/prisma/index.js'
import type { Redis } from 'ioredis'
import type { pubSub } from '../../lib/pubsub.js'

export class TaskService {
	private taskRepo: TaskRepository
	private statsService: StatsService

	constructor(
		private prisma: PrismaClient,
		private redis: Redis,
		private pubSubInstance: typeof pubSub
	) {
		this.taskRepo = new TaskRepository(prisma)
		this.statsService = new StatsService(prisma, redis)
	}

	async createTask(userId: string, rawInput: unknown) {
		const data = CreateTaskSchema.parse(rawInput)
		const task = await this.taskRepo.create(userId, data)
		const boardId = task.column.boardId

		await this.statsService.invalidateCache(boardId)
		console.log(`[PubSub] Task created by user ${userId}`)
		this.pubSubInstance.publish('TASK_CREATED', boardId, { taskCreated: task })

		return task
	}

	async updateTask(taskId: string, userId: string, rawInput: unknown) {
		const data = UpdateTaskSchema.parse(rawInput)

		const accessible = await this.taskRepo.isAccessible(taskId, userId)
		if (!accessible) throw new Error('Task not found or access denied')

		const updated = await this.taskRepo.update(taskId, data)
		const boardId = updated.column.boardId

		await this.statsService.invalidateCache(boardId)
		console.log(`[PubSub] Task updated by user ${userId}`)
		this.pubSubInstance.publish('TASK_UPDATED', boardId, {
			taskUpdated: updated
		})

		return updated
	}

	async moveTask(userId: string, rawInput: unknown) {
		const data = MoveTaskSchema.parse(rawInput)

		const accessible = await this.taskRepo.isAccessible(data.taskId, userId)
		if (!accessible) throw new Error('Task not found or access denied')

		const updated = await this.taskRepo.updatePosition(
			data.taskId,
			data.newColumnId,
			data.newPosition
		)
		const boardId = updated.column.boardId

		await this.statsService.invalidateCache(boardId)
		console.log(`[PubSub] Task moved by user ${userId}`)
		this.pubSubInstance.publish('TASK_MOVED', boardId, { taskMoved: updated })
		this.pubSubInstance.publish('TASK_UPDATED', boardId, {
			taskUpdated: updated
		})

		return updated
	}

	async deleteTask(taskId: string, userId: string) {
		const accessible = await this.taskRepo.isAccessible(taskId, userId)
		if (!accessible) throw new Error('Task not found or access denied')

		const deleted = await this.taskRepo.delete(taskId)
		const boardId = deleted.column.boardId

		await this.statsService.invalidateCache(boardId)
		console.log(`[PubSub] Task deleted by user ${userId}`)
		this.pubSubInstance.publish('TASK_DELETED', boardId, {
			taskDeleted: taskId
		})

		return true
	}
}
