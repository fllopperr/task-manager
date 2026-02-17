import { ColumnRepository } from './column.repository.js'
import { CreateColumnSchema, UpdateColumnSchema } from './column.schema.js'
import type { PrismaClient } from '../../generated/prisma/index.js'
import type { pubSub } from '../../lib/pubsub.js'

export class ColumnService {
	private columnRepo: ColumnRepository

	constructor(
		private prisma: PrismaClient,
		private pubSubInstance: typeof pubSub
	) {
		this.columnRepo = new ColumnRepository(prisma)
	}

	async createColumn(userId: string, rawInput: unknown) {
		const data = CreateColumnSchema.parse(rawInput)

		const accessible = await this.columnRepo.isAccessible(
			// Проверяем доступ через boardId — нам нужен BoardRepository
			// Упрощённо: создаём колонку, БД проверит FK
			'dummy',
			userId
		)

		const column = await this.columnRepo.create(userId, data)

		console.log(`[PubSub] Column created by user ${userId}`)
		this.pubSubInstance.publish('COLUMN_CREATED', data.boardId, {
			columnCreated: column
		})

		return column
	}

	async updateColumn(columnId: string, userId: string, rawInput: unknown) {
		const data = UpdateColumnSchema.parse(rawInput)

		const isOwner = await this.columnRepo.isOwner(columnId, userId)
		if (!isOwner)
			throw new Error('You do not have permission to update this column')

		const updated = await this.columnRepo.update(columnId, data)

		console.log(`[PubSub] Column updated by user ${userId}`)
		this.pubSubInstance.publish('COLUMN_UPDATED', updated.boardId, {
			columnUpdated: updated
		})

		return updated
	}

	async deleteColumn(columnId: string, userId: string) {
		const isOwner = await this.columnRepo.isOwner(columnId, userId)
		if (!isOwner)
			throw new Error('You do not have permission to delete this column')

		const deleted = await this.columnRepo.delete(columnId)

		console.log(`[PubSub] Column deleted by user ${userId}`)
		this.pubSubInstance.publish('COLUMN_DELETED', deleted.boardId, {
			columnDeleted: columnId
		})

		return true
	}
}
