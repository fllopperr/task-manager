import jwt from 'jsonwebtoken'
import { prisma } from './prisma.js'
import { redis } from './redis.js'
import { pubSub } from './pubsub.js'
import { PrismaClient } from '../generated/prisma/index.js'
import type { Redis } from 'ioredis'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
	throw new Error('Missing environment variable: JWT_SECRET')
}

export interface GraphQlContext {
	prisma: PrismaClient
	redis: Redis
	pubSub: typeof pubSub
	userId: string | null
}

function getUserIdFromToken(token: string): string | null {
	try {
		const clean = token.startsWith('Bearer ') ? token.substring(7) : token
		const payload = jwt.verify(clean, JWT_SECRET!) as { userId: string }
		return payload.userId
	} catch {
		return null
	}
}

export async function createContext({
	request
}: {
	request: Request
}): Promise<GraphQlContext> {
	const authHeader = request.headers.get('Authorization')
	const token = authHeader ?? null
	const userId = token ? getUserIdFromToken(token) : null
	return {
		prisma,
		redis,
		pubSub,
		userId
	}
}

export async function createWSContext({
	connectionParams
}: {
	connectionParams?: Record<string, unknown>
}): Promise<GraphQlContext> {
	const authField =
		(connectionParams?.authorization as string) ||
		(connectionParams?.token as string)
	const userId = authField ? getUserIdFromToken(authField) : null

	if (userId) {
		console.log(`[WS Auth] User ${userId} verified`)
	}

	return { prisma, redis, pubSub, userId }
}
