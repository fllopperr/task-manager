import { PrismaClient } from '../generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
	throw new Error('Missing environment variable: DATABASE_URL')
}

const pool = new pg.Pool({
	connectionString: DATABASE_URL,
	max: 20
})

const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({
	adapter
})
