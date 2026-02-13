import { createYoga, createSchema } from 'graphql-yoga'
import { prisma, redis, createContext, createWSContext } from './lib/prisma.js'
import { typeDefs } from './graphql/schema.js'
import { resolvers } from './graphql/resolvers.js'
import type { GraphQlContext } from './lib/prisma.js'
import { makeServer } from 'graphql-ws'

interface WSData {
	id: string
	closed?: (code: number, reason: string) => void
	userContext?: GraphQlContext
}

const PORT = Number(process.env.PORT) || 3000

const schema = createSchema({ typeDefs, resolvers })

const wsServer = makeServer({
	schema,
	context: ctx => createWSContext({ connectionParams: ctx.connectionParams }),
	onDisconnect: async (ctx, code, reason) => {
		const userContext = await createWSContext({
			connectionParams: ctx.connectionParams
		})
		const userLabel = userContext.userId
			? `User ID: ${userContext.userId}`
			: 'Anonymous'
		console.log(`[WS] ${userLabel} disconnected (Reason: ${code})`)
	}
})

const yoga = createYoga<any, GraphQlContext>({
	schema,
	context: createContext,
	maskedErrors: false,
	graphiql: { subscriptionsProtocol: 'WS' }
})

const messageListeners = new Map<string, (data: string) => Promise<void>>()

Bun.serve<WSData>({
	port: PORT,
	idleTimeout: 0,
	fetch(req, server) {
		if (server.upgrade(req, { data: { id: crypto.randomUUID() } }))
			return undefined
		return yoga.fetch(req)
	},
	websocket: {
		async open(ws) {
			const connectionId = ws.data.id

			ws.data.closed = wsServer.opened(
				{
					protocol: (ws as any).protocol || 'graphql-transport-ws',
					send: data => {
						ws.send(data)
					},
					close: (code, reason) => ws.close(code, reason),
					onMessage: cb => messageListeners.set(connectionId, cb)
				},
				{}
			)
			console.log(`[WS] Connection opened: ${connectionId}`)
		},
		async message(ws, message) {
			const listener = messageListeners.get(ws.data.id)
			if (listener) await listener(message.toString())
		},
		close(ws, code, reason) {
			if (ws.data.closed) ws.data.closed(code, reason)
			messageListeners.delete(ws.data.id)
		}
	}
})

console.log(`
  TaskFlow Backend Server
  --------------------------
  http://localhost:${PORT}/graphql
`)

// --- Graceful shutdown ---

const shutdown = async (signal: string) => {
	console.log(`\n[${signal}] Shutting down gracefully...`)
	try {
		await prisma.$disconnect()
		console.log('✓ Database disconnected')
		await redis.quit()
		console.log('✓ Redis disconnected')
		process.exit(0)
	} catch (error) {
		console.error('✗ Error during shutdown:', error)
		process.exit(1)
	}
}

process.once('SIGTERM', () => shutdown('SIGTERM'))
process.once('SIGINT', () => shutdown('SIGINT'))
