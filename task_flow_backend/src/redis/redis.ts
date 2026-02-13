import { Redis } from 'ioredis'
import 'dotenv/config'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

const redis = new Redis(redisUrl, {
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
	console.log('\x1b[32m[Redis]\x1b[0m Connected to', redisUrl)
})

export { redis }
export default redis
