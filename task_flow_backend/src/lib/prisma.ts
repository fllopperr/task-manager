import { Redis } from 'ioredis'
import { PrismaClient } from '../generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import jwt from 'jsonwebtoken'
import { createPubSub } from '@graphql-yoga/subscription'
import { StatsService } from '../services/stats.service.js'

const DATABASE_URL = process.env.DATABASE_URL
const REDIS_URL = process.env.REDIS_URL
const JWT_SECRET = process.env.JWT_SECRET

if (!DATABASE_URL || !REDIS_URL || !JWT_SECRET) {
	throw new Error(
		'Missing critical environment variables (DATABASE_URL, REDIS_URL, or JWT_SECRET)'
	)
}

const pool = new pg.Pool({
	connectionString: DATABASE_URL,
	max: 20
})
const adapter = new PrismaPg(pool)
export const prisma = new PrismaClient({ adapter })

export const redis = new Redis(REDIS_URL)

export const statsService = new StatsService(prisma, redis)

export const pubSub = createPubSub<{
	TASK_CREATED: [boardId: string, payload: { taskCreated: any }]
	TASK_UPDATED: [boardId: string, payload: { taskUpdated: any }]
	TASK_DELETED: [boardId: string, payload: { taskDeleted: string }]
	TASK_MOVED: [boardId: string, payload: { taskMoved: any }]

	COMMENT_ADDED: [boardId: string, payload: { commentAdded: any }]
	COMMENT_UPDATED: [boardId: string, payload: { commentUpdated: any }]
	COMMENT_DELETED: [boardId: string, payload: { commentDeleted: string }]

	BOARD_MEMBER_ADDED: [boardId: string, payload: { boardMemberAdded: any }]
	BOARD_MEMBER_REMOVED: [
		boardId: string,
		payload: { boardMemberRemoved: string }
	]

	COLUMN_CREATED: [boardId: string, payload: { columnCreated: any }]
	COLUMN_UPDATED: [boardId: string, payload: { columnUpdated: any }]
	COLUMN_DELETED: [boardId: string, payload: { columnDeleted: string }]

	USER_PRESENCE: [
		boardId: string,
		payload: {
			userPresence: { userId: string; status: 'online' | 'offline' | 'away' }
		}
	]
	USER_TYPING: [
		taskId: string,
		payload: { userTyping: { userId: string; userName: string } }
	]
}>()

export interface GraphQlContext {
	prisma: PrismaClient
	redis: Redis
	pubSub: typeof pubSub
	statsService: StatsService
	userId: string | null
}

function getUserIdFromToken(token: string): string | null {
	try {
		const payload = jwt.verify(token, JWT_SECRET!) as { userId: string }
		return payload.userId
	} catch (error) {
		return null
	}
}

export async function createContext({
	request
}: {
	request: Request
}): Promise<GraphQlContext> {
	const authHeader = request.headers.get('authorization')
	const token = authHeader?.startsWith('Bearer ')
		? authHeader.substring(7)
		: null
	const userId = token ? getUserIdFromToken(token) : null

	return { prisma, redis, pubSub, statsService, userId }
}

export async function createWSContext({
	connectionParams
}: {
	connectionParams?: Record<string, unknown>
}): Promise<GraphQlContext> {
	const authField =
		(connectionParams?.authorization as string) ||
		(connectionParams?.token as string)
	const token = authField?.replace('Bearer ', '')
	const userId = token ? getUserIdFromToken(token) : null

	if (userId) {
		console.log(`[WS Auth] User ${userId} verified`)
	}

	return { prisma, redis, pubSub, statsService, userId }
}
