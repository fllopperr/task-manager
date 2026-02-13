import { PrismaClient } from '../generated/prisma/index.js'
import { Redis } from 'ioredis'

interface BoardStats {
	totalTasks: number
	updatedAt: string
}

export class StatsService {
	constructor(
		private prisma: PrismaClient,
		private redis: Redis
	) {}

	private getCacheKey(boardId: string): string {
		return `board:stats:${boardId}`
	}

	async getBoardStats(boardId: string): Promise<BoardStats> {
		const cacheKey = this.getCacheKey(boardId)

		try {
			const cachedData = await this.redis.get(cacheKey)
			if (cachedData) {
				return JSON.parse(cachedData)
			}
		} catch (error) {
			console.error('[Redis Error] Get:', error)
		}

		const totalTasks = await this.prisma.task.count({
			where: {
				column: { boardId },
				deletedAt: null
			}
		})

		const stats: BoardStats = {
			totalTasks,
			updatedAt: new Date().toISOString()
		}

		try {
			await this.redis.set(cacheKey, JSON.stringify(stats), 'EX', 3600)
		} catch (error) {
			console.error('[Redis Error] Set:', error)
		}

		return stats
	}

	async invalidateCache(boardId: string): Promise<void> {
		const cacheKey = this.getCacheKey(boardId)
		try {
			await this.redis.del(cacheKey)
		} catch (error) {
			console.error('[Redis Error] Invalidate:', error)
		}
	}
}
