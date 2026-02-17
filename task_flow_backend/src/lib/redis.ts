import { Redis } from 'ioredis'

const REDIS_URL = process.env.REDIS_URL

if (!REDIS_URL) {
	throw new Error('Missing environment variable: REDIS_URL')
}

export const redis = new Redis(REDIS_URL, {
	maxRetriesPerRequest: null,
	retryStrategy: (times: number): number => {
		const delay = Math.min(times * 50, 2000)
		return delay
	},
	lazyConnect: false
})

redis.on('error', error => {
	console.error('\x1b[31m[Redis Error]\x1b[0m', error)
})

redis.on('connect', () => {
	console.log('\x1b[32m[Redis]\x1b[0m Connected to', REDIS_URL)
})
